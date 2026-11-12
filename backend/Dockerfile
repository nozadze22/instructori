FROM node:22-alpine AS deps
WORKDIR /app/backend
RUN corepack enable
COPY messaging /app/messaging
COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./
COPY backend/prisma ./prisma
COPY backend/prisma.config.ts ./
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true
RUN pnpm prisma generate

FROM deps AS build
WORKDIR /app/backend
COPY backend/src ./src
COPY backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json ./
RUN ./node_modules/.bin/nest build

FROM node:22-alpine AS runner
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=8080
COPY backend/package.json backend/pnpm-lock.yaml backend/pnpm-workspace.yaml ./
COPY backend/prisma ./prisma
COPY backend/prisma.config.ts ./
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/src/generated ./src/generated
EXPOSE 8080
CMD ["node", "dist/main.js"]
