'use strict';

// Postinstall script: asks the user for a shortcut name (default "p") and
// creates the corresponding global bin symlink.

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

// Only alphanumeric, hyphens and underscores are allowed as a shortcut name.
const VALID_NAME = /^[a-zA-Z0-9_-]+$/;

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

function createSymlink(customName) {
  if (customName === 'p') {
    // "p" is already wired up via the package.json bin field — nothing to do.
    return;
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
      return;
    }

    // Remove any existing file or dangling symlink at the target path.
    try {
      fs.unlinkSync(target);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    fs.symlinkSync(source, target, 'file');
    console.log(`pnpm-shortcut: created shortcut "${customName}" -> pnpm`);
  } catch (err) {
    console.warn(
      `pnpm-shortcut: could not create custom shortcut "${customName}". ` +
        'You can create it manually: ln -s $(which p) $(dirname $(which p))/' +
        customName
    );
  }
}

function prompt(callback) {
  // On Windows there is no /dev/tty; fall back to the default name.
  if (process.platform === 'win32') {
    callback('p');
    return;
  }

  let ttyInput;
  try {
    // Open /dev/tty directly so the prompt works even when npm/pnpm pipes
    // stdin (which is the common case during a global install).
    ttyInput = fs.openSync('/dev/tty', 'r');
  } catch (_) {
    // Non-interactive environment (CI, piped install) — use the default name.
    callback('p');
    return;
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(null, { fd: ttyInput }),
    output: process.stdout,
    terminal: true,
  });

  rl.question('pnpm-shortcut: Enter shortcut name [p]: ', (answer) => {
    rl.close();
    callback((answer || 'p').trim());
  });
}

prompt((name) => {
  if (!VALID_NAME.test(name)) {
    console.warn(
      `pnpm-shortcut: "${name}" is not a valid shortcut name. ` +
        'Only letters, numbers, hyphens and underscores are allowed. ' +
        'Using the default "p".'
    );
    name = 'p';
  }
  createSymlink(name);
  process.exit(0);
});
