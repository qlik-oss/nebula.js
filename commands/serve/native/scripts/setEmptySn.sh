#!/bin/bash

echo "here is arg 0"
echo $0

basedir=$(dirname $0)

echo "here is basedir"
echo $basedir

echo "import React from 'react'; \n\nconst sn = () => return <></>;\n\nexport default sn" > $basedir/../src/sn/sn.js