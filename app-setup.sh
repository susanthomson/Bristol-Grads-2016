#!/bin/bash

sudo yum -y update

echo "Installing nodejs to yum..."
curl --silent --location https://rpm.nodesource.com/setup_4.x | bash -
sudo yum -y install nodejs

echo "Installing packages..."
sudo npm install

echo "Building project..."
sudo env NODE_ENV=production grunt build

echo "Install complete."

