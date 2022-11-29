# syntax=docker/dockerfile:1

# --------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install
RUN pnpm build
RUN pnpm prune --prod
# --------------------------------
FROM gcr.io/distroless/nodejs:18

COPY --from=builder /app /app

WORKDIR /app

ENV NODE_ENV production

CMD ["build/index.js"]
EXPOSE 3000
# --------------------------------
