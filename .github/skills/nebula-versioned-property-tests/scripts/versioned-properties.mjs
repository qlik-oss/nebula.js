#!/usr/bin/env node
// Evaluates the initial properties of a nebula chart as they were in older releases (git tags).
//
//   node versioned-properties.mjs history --entry <file> [--tags a,b,c] [options]
//       Walks the tags and prints the releases where the properties changed, with what changed.
//   node versioned-properties.mjs fixture --entry <file> --tag <tag> [--out <file>] [options]
//       Writes the properties as they were at one tag.
//
// Run it from the root of the git repository (in a monorepo: the root, with --entry pointing into the chart package).
//
// Options
//   --entry <file>        Module that exports the initial properties, relative to the repo root (required)
//   --export <name>       Export to use, default: "default"
//   --call <json>         When the export is a function, call it with these arguments (JSON array). Default: "[]"
//   --define K=V          Replace an expression like the chart build does, e.g. process.env.PACKAGE_VERSION=@tag
//                         (repeatable; the value "@tag" is replaced by the version of the tag without the "v").
//                         Default: process.env.PACKAGE_VERSION=@tag
//   --ignore-key <key>    Leave a top level key out when comparing releases, default: version (repeatable)
//   --tag-pattern <re>    Which tags to look at when --tags is not given, default: ^v?\d+\.\d+\.\d+$
//   --tag-prefix <p>      Only tags starting with this prefix, for monorepos with per-package tags (e.g. sn-kpi@)
//   --out <file|dir>      Where to write (fixture: file, history --write: directory)
//   --write               history: also write a fixture for every release where the properties changed
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    entry: { type: "string" },
    export: { type: "string", default: "default" },
    call: { type: "string", default: "[]" },
    define: { type: "string", multiple: true },
    "ignore-key": { type: "string", multiple: true },
    tags: { type: "string" },
    tag: { type: "string" },
    "tag-pattern": { type: "string", default: "^v?\\d+\\.\\d+\\.\\d+$" },
    "tag-prefix": { type: "string", default: "" },
    out: { type: "string" },
    write: { type: "boolean", default: false },
  },
});

const [command] = positionals;
if (!["history", "fixture"].includes(command) || !values.entry) {
  console.error("Usage: versioned-properties.mjs <history|fixture> --entry <file> [options]  (see the header of this file)");
  process.exit(1);
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 28 });
const repoRoot = git("rev-parse", "--show-toplevel").trim();
const ignoreKeys = values["ignore-key"] ?? ["version"];
const defines = values.define ?? ["process.env.PACKAGE_VERSION=@tag"];

// esbuild is only used to bundle old versions of the properties module (handles ts and relative imports)
const toolsDir = join(tmpdir(), "nebula-versioned-properties-tools");
const esbuild = join(toolsDir, "node_modules", ".bin", "esbuild");
if (!existsSync(esbuild)) {
  mkdirSync(toolsDir, { recursive: true });
  execFileSync("npm", ["install", "--prefix", toolsDir, "--silent", "--no-audit", "--no-fund", "esbuild@0.25"], {
    stdio: "inherit",
  });
}

// Bundles go in the repo's node_modules so imports of packages resolve like they do for the chart
const cacheDir = join(repoRoot, "node_modules", ".cache", "versioned-properties");
mkdirSync(cacheDir, { recursive: true });

const versionOf = (tag) => tag.replace(/^.*?(\d+\.\d+\.\d+.*)$/, "$1");

const evaluateAt = async (tag) => {
  const src = mkdtempSync(join(tmpdir(), "versioned-properties-src-"));
  try {
    execFileSync("sh", ["-c", `git archive ${JSON.stringify(tag)} | tar -x -C ${JSON.stringify(src)}`], {
      cwd: repoRoot,
      stdio: ["ignore", "ignore", "ignore"],
    });
    const entry = join(src, values.entry);
    if (!existsSync(entry)) {
      return { missing: true };
    }
    const outFile = join(cacheDir, `${tag.replace(/[^\w.-]/g, "_")}.mjs`);
    const args = [entry, "--bundle", "--format=esm", "--platform=node", "--packages=external", `--outfile=${outFile}`, "--log-level=error"];
    for (const define of defines) {
      const [key, ...rest] = define.split("=");
      const value = rest.join("=").replace("@tag", versionOf(tag));
      args.push(`--define:${key}=${JSON.stringify(value)}`);
    }
    execFileSync(esbuild, args, { stdio: ["ignore", "inherit", "inherit"] });
    // Bust the module cache of the bundles, tags can be evaluated more than once
    let exported = (await import(`${pathToFileURL(outFile).href}?t=${Date.now()}`))[values.export];
    if (typeof exported === "function") {
      exported = await exported(...JSON.parse(values.call));
    }
    return { properties: JSON.parse(JSON.stringify(exported)) };
  } finally {
    rmSync(src, { recursive: true, force: true });
  }
};

const flatten = (value, path = "", out = {}) => {
  if (value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, path ? `${path}.${key}` : key, out);
    }
  } else {
    out[path] = JSON.stringify(value);
  }
  return out;
};

const normalize = (properties) => {
  const copy = { ...properties };
  for (const key of ignoreKeys) {
    delete copy[key];
  }
  return copy;
};

const diff = (before, after) => {
  const a = flatten(before);
  const b = flatten(after);
  const lines = [];
  for (const path of Object.keys(b)) {
    if (!(path in a)) lines.push(`+ ${path} = ${b[path]}`);
    else if (a[path] !== b[path]) lines.push(`~ ${path}: ${a[path]} -> ${b[path]}`);
  }
  for (const path of Object.keys(a)) {
    if (!(path in b)) lines.push(`- ${path}`);
  }
  return lines;
};

const listTags = () => {
  if (values.tags) {
    return values.tags.split(",");
  }
  const pattern = new RegExp(values["tag-pattern"]);
  // Oldest first, by version so backport patches do not end up out of order
  return git("tag", "--sort=version:refname")
    .split("\n")
    .filter((tag) => tag && tag.startsWith(values["tag-prefix"]) && pattern.test(tag.slice(values["tag-prefix"].length)));
};

const write = (file, properties) => {
  mkdirSync(dirname(resolve(file)), { recursive: true });
  writeFileSync(file, `${JSON.stringify(properties, null, 2)}\n`);
  console.log(`Wrote ${file}`);
};

if (command === "fixture") {
  if (!values.tag) {
    console.error("--tag is required");
    process.exit(1);
  }
  const { properties, missing } = await evaluateAt(values.tag);
  if (missing) {
    console.error(`${values.entry} does not exist at ${values.tag}. It may have moved: git log --follow -- ${values.entry}`);
    process.exit(1);
  }
  write(values.out ?? `${values.tag}.properties.json`, properties);
} else {
  let previous;
  let previousTag;
  const skipped = [];
  for (const tag of listTags()) {
    const { properties, missing } = await evaluateAt(tag);
    if (missing) {
      skipped.push(tag);
      continue;
    }
    const current = normalize(properties);
    if (!previous) {
      console.log(`${tag}  first release with ${values.entry} (${Object.keys(flatten(current)).length} properties)`);
    } else {
      const changes = diff(previous, current);
      if (changes.length > 0) {
        console.log(`\n${tag}  (changed since ${previousTag})`);
        changes.forEach((line) => console.log(`  ${line}`));
      } else {
        previous = current;
        previousTag = tag;
        continue;
      }
    }
    if (values.write) {
      write(join(values.out ?? "versioned-properties", `${tag}.properties.json`), properties);
    }
    previous = current;
    previousTag = tag;
  }
  if (skipped.length > 0) {
    console.log(`\nNo ${values.entry} at ${skipped.length} tags (${skipped[0]} ... ${skipped.at(-1)}), the file may have been moved or renamed.`);
  }
}
