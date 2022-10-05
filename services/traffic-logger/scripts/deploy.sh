#!/usr/bin/env bash

branch=$(git rev-parse --abbrev-ref HEAD)
env="canary"
if [ $branch == "main" ]; then
	env="production"
fi

../../scripts/secrets.sh verify DISCORD_WEBHOOK LOGZIO_TOKEN -- --env $env
wrangler publish --env $env
../../scripts/secrets.sh push DISCORD_WEBHOOK LOGZIO_TOKEN -- --env $env
