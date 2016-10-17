#!/bin/bash

# Kill all running node instances
nodeProc="$(pgrep node)"
if [ nodeProc ]; then
    sudo kill $nodeProc
fi

