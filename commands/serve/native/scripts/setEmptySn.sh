#!/bin/bash

basedir=$(dirname $0)
echo "const sn = () => {return (<></>);}export default sn" > $basedir/../src/sn/sn.js