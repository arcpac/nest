This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Nest App

First, run the development server:

```bash

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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


## Database details
- [**Postgres**](https://orm.drizzle.team/docs/get-started/postgresql-new) – Relational database engine (RDBMS)
- [**Drizzle**](https://orm.drizzle.team/docs/get-started/postgresql-new) – Type-safe ORM / query builder for TypeScript
- [**dbDiagram**](https://dbdiagram.io/home) – Database schema visualization tool

### Setup database environment

## Nest App
First, run the development server:

## Upcoming features

### 1. Receipt capture → OCR → auto expense draft
**What:** Upload a receipt and automatically pre-fill expense details (amount, date, merchant).  
**Approach:** Use an OCR provider (or start with “manual + smart suggestions” as an MVP).  
**Senior signals:** Async processing pipeline, file storage, retries, parsing confidence scores.  
**MVP scope:** Upload → background job extracts fields → user confirms → creates expense.

### 2. Notifications (Email + Push)
**What:** Notify members when they’re added, when an expense is created, and when balances change.  
**Email provider:** Resend / SendGrid / similar.  
**Push:** Web Push (PWA) for real-time notifications.  
**Senior signals:** Event-driven design, notification preferences, batching/digests.  

### 3. Invite to household via magic links
**What:** Invite members via a secure token link to join a household.  
**Senior signals:** Secure token design, expiry handling, replay protection.



.env variables

DATABASE_URL="postgresql://<asdf>:adsf@localhost:5432/nest"
NEXTAUTH_SECRET="asdf"

UPSTASH_REDIS_REST_URL="https:asdf"
UPSTASH_REDIS_REST_TOKEN="NDAzODI"

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=asdf
SMTP_PASS=asdf
SMTP_FROM="SplitNest <no-reply@domain.com>"

OTP_SECRET=some-long-random-string

