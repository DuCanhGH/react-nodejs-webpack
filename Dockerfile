FROM node:16.17.1-alpine

WORKDIR /app

COPY ["package.json", "pnpm-lock.yaml", "./"]

RUN npm i -g pnpm

RUN pnpm install

COPY . .

ENV NODE_ENV=production

RUN pnpm build

RUN pnpm prune --production

CMD ["pnpm", "start"]