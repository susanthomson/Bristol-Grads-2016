#!/bin/bash

# Copy server config files stored in the EC2 directory to the appropriate folder
sudo cp /home/ec2-user/TwitterWallConfig/adminConfig.json /home/ec2-user/TwitterWallApp/server/config/adminConfig.json
sudo cp /home/ec2-user/TwitterWallConfig/eventConfig.json /home/ec2-user/TwitterWallApp/server/config/eventConfig.json

