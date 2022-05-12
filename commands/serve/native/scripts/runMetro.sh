#!/bin/bash

echo "Welcome to the Nebula Serve Gatekeeper Script"

snPath=$1
snName=$2
context=$3
platform=$4
basedir=$(dirname $0)

echo "snPath = $snPath"
echo "snName = $snName"
echo "context = $context"
echo "platform = $platform"

export SN_PATH=${snPath}
export SN_NAME=${snName}

echo "SN_PATH = $SN_PATH"
echo "SN_NAME = $SN_NAME"
# generate sn.js
echo "import sn from '${context}';\n\nexport default sn;" > $basedir/../src/sn/sn.js

react-native start --watchFolders ${context}
