#!/bin/bash

docker build -f ./tg-bot/Dockerfile -t hugis420/$REPOSITORY:$IMAGE_TAG .
docker push hugis420/$REPOSITORY:$IMAGE_TAG
