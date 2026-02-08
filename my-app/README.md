# my-app frontend

## Fix for `@tailwindcss/postcss` build error

If Turbopack reports:

`Cannot find module '@tailwindcss/postcss'`

this project intentionally uses plain CSS (`app/globals.css`) without Tailwind.
`postcss.config.mjs` is pinned to an empty plugins object so Next.js does not try
loading Tailwind PostCSS plugin.
