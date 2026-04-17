This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a local `.env.local` file before running DDL-backed selectors:

```bash
API_STATIO_GOFIVE_KEY=your_core_api_key
API_KEY_EMPEO=your_empeo_api_key
DDL_USER_ID=a5b6f347-eff9-4fe4-a9c6-4ce89fe74391

# Optional (defaults are already set in code)
API_CORE_BASE_URL=https://api-core.empeo.com
API_EMPEO_BASE_URL=https://api.empeo.com
```

These variables are consumed by server-side proxy routes:

- `GET /api/ddl/org-node`
- `GET /api/ddl/assessment-sets`

Do not expose these keys in client-side `NEXT_PUBLIC_*` variables.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
