#!/bin/bash

echo "Starting application"
source /home/ec2-user/TwitterWallConfig/env.sh
sudo -E npm start &
echo "Application started successfully!"

