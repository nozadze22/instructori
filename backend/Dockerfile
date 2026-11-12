FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true
RUN pnpm prisma generate

FROM deps AS build
COPY src ./src
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
RUN ./node_modules/.bin/nest build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated
EXPOSE 8080
CMD ["node", "dist/main.js"]
