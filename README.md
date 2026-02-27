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

The installer will interactively ask for a shortcut name during `npm install -g`.
Just press **Enter** to accept the default (`p`), or type any name you prefer:

```
pnpm-shortcut: Enter shortcut name [p]: pn
pnpm-shortcut: created shortcut "pn" -> pnpm
```

In non-interactive environments (CI, piped installs) the default `p` is used
automatically without any prompt.

## How it works

`pnpm-shortcut` is a tiny Node.js wrapper that forwards all arguments and
stdio directly to `pnpm`, so every feature (colors, interactive prompts,
exit codes) works exactly as expected.

## License

MIT
