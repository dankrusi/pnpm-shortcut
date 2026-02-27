# pnpm-shortcut

Type `p` instead of `pnpm` — a lightweight global shortcut for [pnpm](https://pnpm.io).

## Installation

```sh
npm install -g pnpm-shortcut
# or
pnpm add -g pnpm-shortcut
```

After installation the `p` command is available globally:

```sh
p install
p add react
p run build
```

### Custom shortcut name

Pass a custom name via the `npm_config_pnpm_shortcut_name` environment variable
(or `PNPM_SHORTCUT_NAME`) and the postinstall script will create an additional
symlink with that name alongside the default `p`:

```sh
# Use "pn" instead of "p"
npm_config_pnpm_shortcut_name=pn npm install -g pnpm-shortcut

# or with pnpm
PNPM_SHORTCUT_NAME=pn pnpm add -g pnpm-shortcut
```

## How it works

`pnpm-shortcut` is a tiny Node.js wrapper that forwards all arguments and
stdio directly to `pnpm`, so every feature (colors, interactive prompts,
exit codes) works exactly as expected.

## License

MIT
