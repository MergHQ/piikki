#!/bin/bash

docker build -f ./sync/Dockerfile -t hugis420/$REPOSITORY:$IMAGE_TAG .
docker push hugis420/$REPOSITORY:$IMAGE_TAG
