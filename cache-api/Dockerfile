FROM node:14-alpine

WORKDIR /app

COPY ./src /app/src
COPY package.json /app/package.json
COPY tsconfig.json /app/tsconfig.json
COPY yarn.lock /app/yarn.lock

RUN yarn install
RUN yarn build

CMD ["yarn", "start"]
