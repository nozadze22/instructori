FROM node:22-alpine AS deps
WORKDIR /app/chat
RUN corepack enable
COPY messaging /app/messaging
COPY chat/package.json chat/pnpm-lock.yaml chat/.npmrc ./
COPY chat/prisma ./prisma
COPY chat/prisma.config.ts ./
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true --config.minimumReleaseAge=0
RUN pnpm prisma:generate

FROM deps AS build
WORKDIR /app/chat
COPY chat/src ./src
COPY chat/tsconfig.json chat/tsconfig.build.json chat/nest-cli.json ./
RUN ./node_modules/.bin/nest build

FROM node:22-alpine AS runner
WORKDIR /app/chat
ENV NODE_ENV=production
ENV PORT=8080
COPY chat/package.json chat/pnpm-lock.yaml chat/.npmrc ./
COPY chat/prisma ./prisma
COPY chat/prisma.config.ts ./
COPY --from=build /app/chat/node_modules ./node_modules
COPY --from=build /app/chat/dist ./dist
EXPOSE 8080
CMD ["node", "dist/main.js"]
