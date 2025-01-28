#!/bin/bash
set -e
export PATH="/root/.nvm/versions/node/v18.19.1/bin:$PATH"
cd /home/ubuntu/tracebalebackend-staging


npm install
npm run build
pm2 delete 0 || true
pm2 start npm --name "backend" -- start

service nginx restart
