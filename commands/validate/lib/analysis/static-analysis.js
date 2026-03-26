import path from 'path';
import fs from 'fs';

import { listFiles, normalizePath } from '../utils/file-system.js';

const getLineNumber = (content, index) => content.slice(0, index).split('\n').length;
const EXT_FILE_RX = /(^|\/)ext\.[jt]sx?$/;
const ENTRY_FILE_RX = /(^|\/)index\.[jt]sx?$/;
const ALLOWED_GALAXY_PROPS = new Set(['translator', 'theme', 'deviceType', 'hostConfig', 'anything']);

const SPEC_PATH_CANDIDATES = [
  new URL('../../../../apis/stardust/api-spec/spec.json', import.meta.url),
  new URL('../../../../node_modules/@nebula.js/stardust/api-spec/spec.json', import.meta.url),
];

const readDeprecatedStardustEntries = () => {
  const deprecated = new Map();

  const walkEntries = (entries = {}) => {
    Object.entries(entries).forEach(([name, node]) => {
      if (node && node.availability && node.availability.deprecated) {
        deprecated.set(name, node.description || 'Deprecated stardust API usage.');
      }
      if (node && node.entries) {
        walkEntries(node.entries);
      }
    });
  };

  for (let i = 0; i < SPEC_PATH_CANDIDATES.length; i += 1) {
    const specPath = SPEC_PATH_CANDIDATES[i];
    try {
      const raw = fs.readFileSync(specPath, 'utf-8');
      const spec = JSON.parse(raw);
      walkEntries(spec.entries || {});
      if (deprecated.size) {
        return deprecated;
      }
    } catch {
      // Continue and try next path candidate.
    }
  }

  return deprecated;
};

const findNebulaImports = (content) => {
  const imports = [];
  const importRx = /import\s+(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g;
  for (const match of content.matchAll(importRx)) {
    imports.push({
      specifier: match[1],
      index: match.index,
    });
  }
  return imports;
};

const findStardustNamedImports = (content) => {
  const imports = [];
  const namedImportRx = /import\s*\{([^}]+)\}\s*from\s*['"]@nebula\.js\/stardust['"]/g;

  for (const match of content.matchAll(namedImportRx)) {
    const line = match[1] || '';
    line
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        const aliasMatch = part.match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/);
        if (aliasMatch) {
          imports.push({
            imported: aliasMatch[1],
            local: aliasMatch[2] || aliasMatch[1],
            index: match.index,
          });
        }
      });
  }

  return imports;
};

const findSupernovaParamNames = (content) => {
  const names = new Set();
  const patterns = [
    /export\s+default\s+function\s+supernova\s*\(\s*([A-Za-z_$][\w$]*)/g,
    /function\s+supernova\s*\(\s*([A-Za-z_$][\w$]*)/g,
    /(?:const|let|var)\s+supernova\s*=\s*\(\s*([A-Za-z_$][\w$]*)\s*\)\s*=>/g,
  ];
  patterns.forEach((pattern) => {
    for (const match of content.matchAll(pattern)) {
      names.add(match[1]);
    }
  });
  return [...names];
};

const analyzeNebulaImports = ({ file, content, addFinding }) => {
  const nebulaImports = findNebulaImports(content).filter(({ specifier }) => specifier.startsWith('@nebula.js/'));

  nebulaImports.forEach(({ specifier, index }) => {
    if (specifier === '@nebula.js/stardust') {
      return;
    }

    addFinding(
      'warning',
      file,
      getLineNumber(content, index),
      `Non-public Nebula import detected (${specifier}). Chart code should import public APIs from @nebula.js/stardust.`
    );
  });
};

const analyzeDeprecatedApis = ({ file, content, addFinding, deprecatedStardustEntries }) => {
  const stardustImports = findStardustNamedImports(content);

  stardustImports.forEach(({ imported, local, index }) => {
    if (!deprecatedStardustEntries.has(imported)) {
      return;
    }

    const description = deprecatedStardustEntries.get(imported) || 'Deprecated stardust API usage.';
    addFinding(
      'warning',
      file,
      getLineNumber(content, index),
      `Deprecated API import detected (${imported}). ${description}`
    );

    const callRx = new RegExp(`\\b${local}\\s*\\(`, 'g');
    for (const match of content.matchAll(callRx)) {
      addFinding(
        'warning',
        file,
        getLineNumber(content, match.index),
        `Deprecated API usage detected (${local}()). ${description}`
      );
    }
  });

  // Keep compatibility warning for the historical misspelled hook.
  for (const match of content.matchAll(/\buseContraints\s*\(/g)) {
    addFinding(
      'warning',
      file,
      getLineNumber(content, match.index),
      'Deprecated API usage detected (useContraints()). Use useInteractionState instead.'
    );
  }
};

const analyzeGalaxyUsage = ({ file, content, addFinding }) => {
  const normalizedFile = file.replace(/\\/g, '/');
  if (EXT_FILE_RX.test(normalizedFile) || !ENTRY_FILE_RX.test(normalizedFile)) {
    return;
  }

  const paramNames = findSupernovaParamNames(content);
  paramNames.forEach((paramName) => {
    const propAccessRx = new RegExp(`\\b${paramName}\\.([A-Za-z_$][\\w$]*)`, 'g');
    for (const match of content.matchAll(propAccessRx)) {
      const prop = match[1];
      if (!ALLOWED_GALAXY_PROPS.has(prop)) {
        addFinding(
          'warning',
          file,
          getLineNumber(content, match.index),
          `Accessing ${paramName}.${prop} is not part of the supported galaxy API for chart code.`
        );
      }
    }
  });
};

export const runStaticAnalysis = ({ cwd }) => {
  const deprecatedStardustEntries = readDeprecatedStardustEntries();

  const files = listFiles({
    dir: path.join(cwd, 'src'),
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
    excludeDirs: ['node_modules', 'dist', 'core', '.git'],
  });

  const findings = [];
  const addFinding = (severity, file, line, message) => {
    findings.push({
      severity,
      file: normalizePath(cwd, file),
      line,
      message,
    });
  };

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');

    analyzeNebulaImports({ file, content, addFinding });
    analyzeDeprecatedApis({ file, content, addFinding, deprecatedStardustEntries });
    analyzeGalaxyUsage({ file, content, addFinding });

    const cssImportRx = /import\s+['"][^'"]+\.css['"]|import\s+[^;]+from\s+['"][^'"]+\.css['"]/g;
    for (const match of content.matchAll(cssImportRx)) {
      addFinding(
        'warning',
        file,
        getLineNumber(content, match.index),
        'Global CSS import detected. Prefer scoped styling to avoid style leakage between visualizations.'
      );
    }

    const domAccessRx =
      /document\.(querySelector|getElementById|getElementsByClassName|getElementsByTagName|body|documentElement)|window\.document/g;
    for (const match of content.matchAll(domAccessRx)) {
      addFinding(
        'warning',
        file,
        getLineNumber(content, match.index),
        'Direct global DOM access detected. Prefer using useElement and element-local queries in supernovas.'
      );
    }

    if (/addEventListener\s*\(/.test(content) && !/removeEventListener\s*\(/.test(content)) {
      addFinding('warning', file, 1, 'addEventListener is used without removeEventListener; possible memory leak.');
    }

    if (/setInterval\s*\(/.test(content) && !/clearInterval\s*\(/.test(content)) {
      addFinding('warning', file, 1, 'setInterval is used without clearInterval; possible memory leak.');
    }
  });

  return findings;
};
