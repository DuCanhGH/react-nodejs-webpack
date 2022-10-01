FROM node:16.17.1-alpine

WORKDIR /app

COPY ["package.json", "pnpm-lock.yaml", "./"]

RUN npm i -g pnpm

RUN pnpm install

RUN pnpm build

RUN pnpm prune --production

ENV NODE_ENV=production

COPY . .

CMD ["pnpm", "start"]