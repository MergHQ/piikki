#!/bin/bash

docker build -f ./tg-bot/Dockerfile -t registry.digitalocean.com/merg-registry/piikki-tg-bot:latest .
docker push registry.digitalocean.com/merg-registry/piikki-tg-bot:latest
