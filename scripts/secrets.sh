#!/usr/bin/env bash

action=$1
shift
rest=$@
help="Usage: ./secrets.sh [help|verify|push] [ENV_VAR_1] [ENV_VAR_2] ... -- <options>"
sha=$(git rev-parse --short HEAD)
release=$(git log -1 --date=format:"%Y-%m-%d" --format="%ad")

vars=()
opts=()
options="0"
for str in ${rest[@]}; do
	if [ $str == "--" ]; then
		options="1"
	else
		if [ $options == "0" ]; then
			vars+=($str)
		else
			opts+=($str)
		fi
	fi
done

if [[ $action == *"help"* ]]; then
	echo $help
	exit 0
fi

if [[ $action == "verify" ]]; then
	for var in ${vars[@]}; do
		value=$(printenv $var)
		if [ -z $value ]; then
			echo "$var is not available"
			exit 1
		fi
	done
	exit 0
fi

if [[ $action == "push" ]]; then
	for var in ${vars[@]}; do
		value=$(printenv $var)
		echo $value | wrangler secret put $var ${opts[@]}
	done
	echo $sha | wrangler secret put VERSION ${opts[@]}
	echo $release | wrangler secret put RELEASE ${opts[@]}
	exit 0
fi

echo "Unssuported or missing action $action"
echo $help
exit 1
