#!/bin/bash

echo "here is arg 0"
echo $0

basedir=$(dirname $0)

echo "const sn = () => {return (<></>);}\n\nexport default sn" > $basedir/../src/sn/sn.js