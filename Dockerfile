FROM node:16.17.1-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "pnpm-lock.yaml", "./"]

RUN npm i -g pnpm

RUN pnpm install

RUN pnpm build

RUN pnpm prune --production

COPY . .

CMD ["pnpm", "start"]