#!/usr/bin/env node

'use strict';

const { spawnSync } = require('child_process');

const result = spawnSync('pnpm', process.argv.slice(2), { stdio: 'inherit' });

process.exit(result.status !== null ? result.status : 1);
