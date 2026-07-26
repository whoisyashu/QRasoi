# QRasoi API

Production Node.js/Express backend, isolated in `/server`. The React frontend is not modified.

## Setup

```bash
cd server
cp .env.example .env
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

Set `DATABASE_URL` to the Supabase PostgreSQL connection URL and provide two independent 32+ character JWT secrets. `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be copied to `VITE_*` variables. The API listens on port 8080 by default. Health: `/health`; interactive API docs: `/api/docs`.

## API integration

The frontend should use `http://localhost:8080` as its API base URL. Public QR menus are `GET /api/public/r/:publicId`; owner registration and login are `/api/auth/register` and `/api/auth/login`; the isolated admin login is `POST /admin/login`. Every response has `success`, `message`, `data`, `errors`, `timestamp`, and `requestId`.

## Security

Passwords are BCrypt-hashed. Access tokens are short-lived JWTs; refresh tokens are hashed in PostgreSQL, rotated at refresh, and revocable. Helmet, strict CORS, a rate limit, request IDs, Pino redaction, Zod validation and typed error responses are applied globally. No Cloudinary secret is returned by this API.

## Database

Prisma schema and a deployable initial migration live in `/prisma`. UUIDs are primary keys and NanoIDs are the only public restaurant/order identifiers. Database creation is migration-only; there is no demo data.
