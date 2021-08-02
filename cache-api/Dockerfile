FROM public.ecr.aws/lambda/nodejs:14

WORKDIR /app/cache-api

COPY ./cache-api/src /app/cache-api/src
COPY ./cache-api/package.json /app/cache-api/package.json
COPY ./cache-api/tsconfig.json /app/cache-api/tsconfig.json
COPY ./cache-api/yarn.lock /app/cache-api/yarn.lock
COPY ./shared /app/shared

RUN yarn install
RUN yarn build

CMD ["yarn", "start"]
