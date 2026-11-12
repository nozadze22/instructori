FROM node:22-alpine AS deps
WORKDIR /app/notification
RUN corepack enable
COPY messaging /app/messaging
COPY notification/package.json notification/pnpm-lock.yaml notification/.npmrc ./
COPY notification/prisma ./prisma
COPY notification/prisma.config.ts ./
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true --config.minimumReleaseAge=0
RUN pnpm prisma:generate

FROM deps AS build
WORKDIR /app/notification
COPY notification/src ./src
COPY notification/tsconfig.json notification/tsconfig.build.json notification/nest-cli.json ./
RUN ./node_modules/.bin/nest build

FROM node:22-alpine AS runner
WORKDIR /app/notification
ENV NODE_ENV=production
ENV PORT=8080
COPY notification/package.json notification/pnpm-lock.yaml notification/.npmrc ./
COPY notification/prisma ./prisma
COPY notification/prisma.config.ts ./
COPY --from=build /app/notification/node_modules ./node_modules
COPY --from=build /app/notification/dist ./dist
EXPOSE 8080
CMD ["node", "dist/main.js"]
