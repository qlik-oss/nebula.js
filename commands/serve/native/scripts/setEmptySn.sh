#!/bin/bash

basedir=$(dirname $0)
echo "const sn = () => {return (<></>);}\nexport default sn" > ./src/sn/sn.js