FROM node:14-alpine

WORKDIR /app/tg-bot

COPY ./tg-bot/app.ts /app/tg-bot/app.ts
COPY ./tg-bot/package.json /app/tg-bot/package.json
COPY ./tg-bot/tsconfig.json /app/tg-bot/tsconfig.json
COPY ./tg-bot/yarn.lock /app/tg-bot/yarn.lock
COPY ./shared /app/shared

RUN yarn install
RUN yarn build

CMD ["yarn", "post"]
