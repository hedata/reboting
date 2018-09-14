# Reboting
Exploring austria's open Data with a bot

## Introduction
Web Client Interface for reboting.com. Angular Application with MongoDB as database and an express server. The express server handles communication with https://dialogflow.com/ for intent detection and natural language processing.

# Requirements
* node
* npm
* docker

## Dev Server
* add environment variables and tokens in docker-compose.yml
* docker-compose up -d
* npm run devstart
* for testing notebooks goto http://localhost:8888

# Update Packages
npm install -g npm-check-updates
npm-check-updates -u
npm install

# Updates
docker-compose down
ng build --prod --aot
docker-compose up -d --build

# Reset Database Mongo with Mongobooster
db.externalvisuals.remove({})
db.usersearchresults.remove({})
db.datasources.remove({})
db.logs.remove({})
db.ratings.remove({})
db.usersearchresults.remove({})
db.users.remove({})
