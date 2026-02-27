'use strict';

// This postinstall script creates an additional global bin symlink when the
// user requests a custom shortcut name (default is "p").
//
// Usage examples:
//   PNPM_SHORTCUT_NAME=pn npm install -g pnpm-shortcut
//   PNPM_SHORTCUT_NAME=pn pnpm add -g pnpm-shortcut

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const customName =
  process.env.npm_config_pnpm_shortcut_name ||
  process.env.PNPM_SHORTCUT_NAME;

if (!customName || customName === 'p') {
  // Nothing extra to do — "p" is already wired up via package.json bin field.
  process.exit(0);
}

function findBinDir() {
  // 1. npm sets npm_config_prefix during global installs.
  if (process.env.npm_config_prefix) {
    return path.join(process.env.npm_config_prefix, 'bin');
  }
  // 2. Derive from the node executable path — on most platforms the global npm
  //    bin lives next to the node binary.
  const nodeDir = path.dirname(process.execPath);
  if (fs.existsSync(path.join(nodeDir, 'p'))) {
    return nodeDir;
  }
  // 3. Fall back to asking npm.
  try {
    const prefix = execSync('npm prefix -g', { encoding: 'utf8' }).trim();
    return path.join(prefix, 'bin');
  } catch (_) {}
  return null;
}

try {
  const binDir = findBinDir();
  if (!binDir) {
    throw new Error('could not determine global bin directory');
  }

  const source = path.join(binDir, 'p');
  const target = path.join(binDir, customName);

  if (!fs.existsSync(source)) {
    console.warn(
      `pnpm-shortcut: could not find the "p" binary in ${binDir} to create the "${customName}" alias.`
    );
    process.exit(0);
  }

  // Remove any existing file or dangling symlink at the target path.
  try {
    fs.unlinkSync(target);
  } catch (_) {}

  fs.symlinkSync(source, target, 'file');
  console.log(`pnpm-shortcut: created shortcut "${customName}" -> pnpm`);
} catch (err) {
  console.warn(
    `pnpm-shortcut: could not create custom shortcut "${customName}". ` +
      'You can create it manually: ln -s $(which p) $(dirname $(which p))/' +
      customName
  );
}
