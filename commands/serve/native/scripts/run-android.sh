#!/bin/bash
echo "--- Building nebula serve for android ---"
cd ../native
yarn install
bundle install
yarn run android