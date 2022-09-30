#!/usr/bin/env bash

action=$1
shift
vars=$@
help="Usage: ./secrets.sh [help|verify|push] [ENV_VAR_1] [ENV_VAR_2] ..."
sha=$(git rev-parse --short HEAD)

if [[ $action == *"help"* ]]; then
	echo $help
	exit 0
fi

if [[ $action == "verify" ]]; then
	for var in ${vars[@]}; do
		value=$(printenv $var)
		if [ -z $value ]; then
			echo "$var is not set"
			exit 1
		fi
	done
	exit 0
fi

if [[ $action == "push" ]]; then
	for var in ${vars[@]}; do
		value=$(printenv $var)
		echo $value | wrangler secret put $var
		echo $sha | wrangler secret put VERSION
	done
	exit 0
fi

echo "Unssuported or missing action $action"
echo $help
exit 1
