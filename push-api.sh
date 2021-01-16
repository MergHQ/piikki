#!/bin/bash

docker build -f ./cache-api/Dockerfile -t registry.digitalocean.com/merg-registry/piikki-cache-api:latest .
docker push registry.digitalocean.com/merg-registry/piikki-cache-api:latest
