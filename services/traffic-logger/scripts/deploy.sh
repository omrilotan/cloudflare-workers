#!/usr/bin/env bash

branch=$(git rev-parse --abbrev-ref HEAD)

npm_config_yes=true npm create wrangler

if [ $branch != "main" ]; then
	exit 0
fi

echo "Deploy gateway"
../../scripts/secrets.sh verify DISCORD_WEBHOOK -- --env gateway
wrangler deploy --env main
../../scripts/secrets.sh push DISCORD_WEBHOOK -- --env gateway
