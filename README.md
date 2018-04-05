# Reboting
Playing around with Bots .-)

# Requirements
* node
* npm

## Dev Server
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

# Other stuff
## what is listening on my local machine
netstat -ntlp | grep LISTEN

## fix inotify shit
echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
