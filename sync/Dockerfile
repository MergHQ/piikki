FROM public.ecr.aws/lambda/nodejs:14

WORKDIR /app/sync

COPY ./sync/src /app/sync/src
COPY ./sync/package.json /app/sync/package.json
COPY ./sync/tsconfig.json /app/sync/tsconfig.json
COPY ./sync/yarn.lock /app/sync/yarn.lock
COPY ./shared /app/shared

RUN npm install -g yarn
RUN yarn install
RUN yarn build

CMD ["dist.sync.src.app.handler"]
