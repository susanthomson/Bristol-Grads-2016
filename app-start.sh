#!/bin/bash

set -e

cd /home/ec2-user/TwitterWallApp
echo "Starting application"
source /home/ec2-user/TwitterWallConfig/env.sh > logs/src.log
npm start > logs/out.log 2> logs/err.log < /dev/null &
disown -h `pgrep node` > logs/dis.log
echo "Application started successfully!"

