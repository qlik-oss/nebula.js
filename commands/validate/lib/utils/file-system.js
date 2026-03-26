import fs from 'fs';
import path from 'path';

export const exists = (targetPath) => {
  try {
    fs.accessSync(targetPath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf-8'));

export const normalizePath = (cwd, file) => path.relative(cwd, file);

export const listFiles = ({ dir, extensions, excludeDirs }) => {
  if (!exists(dir)) {
    return [];
  }

  const files = [];
  const walk = (current) => {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    entries.forEach((entry) => {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          walk(absolute);
        }
        return;
      }
      if (extensions.includes(path.extname(entry.name))) {
        files.push(absolute);
      }
    });
  };

  walk(dir);
  return files;
};
