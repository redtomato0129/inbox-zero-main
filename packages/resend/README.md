# Email updates

This package is used to send transactional emails to users.

## Running locally

Should now work with [pnpm workspaces](https://react.email/docs/getting-started/monorepo-setup/pnpm), so just do:

```bash
pnpm i
pnpm dev
```

## Old notes

You need to do some extra steps to get this to work with pnpm workspaces as noted [here](https://github.com/resendlabs/react-email/issues/881).

```bash
cd .react-email
yarn # pnpm won't work
```

Then from the package root, you can run:

```bash
yarn dev
```

To see the stats email, go to http://localhost:3010/preview/stats.
