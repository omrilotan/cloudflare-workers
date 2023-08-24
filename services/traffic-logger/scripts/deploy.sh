#!/usr/bin/env bash

branch=$(git rev-parse --abbrev-ref HEAD)

npm_config_yes=true npm create wrangler

echo "Deploy canary"
../../scripts/secrets.sh verify DISCORD_WEBHOOK LOGZIO_TOKEN -- --env canary
wrangler deploy --env canary
../../scripts/secrets.sh push DISCORD_WEBHOOK LOGZIO_TOKEN -- --env canary

if [ $branch != "main" ]; then
	exit 0
fi

echo "Deploy main"
../../scripts/secrets.sh verify DISCORD_WEBHOOK LOGZIO_TOKEN -- --env main
wrangler deploy --env main
../../scripts/secrets.sh push DISCORD_WEBHOOK LOGZIO_TOKEN -- --env main

echo "Deploy gateway"
wrangler deploy --env gateway
