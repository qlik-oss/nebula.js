#!/bin/bash
echo "you ran nebula serve --nativeIos! GREAT JOB!"
cd ../native
yarn install
bundle install
cd ios 
pod install
cd ../
yarn run ios