#!/bin/sh
echo 'Migrating db and starting font service...'
pnpm install
npx prisma db push
pnpm build
npx prisma studio
npm run start