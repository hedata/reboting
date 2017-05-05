# Reboting

##Dev Server
docker-compose up

for serving new client files use 

# Deployment:
* running on normal vm azure  - port 80 , 443 and ssh open from the outside world
  * login ssh is only valid with key

* internal routing with iptables
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 3001

so we can run node service as non root user

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).



#Docker
run in a docker container for simplicity -> mapped to a local volume for data

docker pull mongo
docker pull nginx
docker pull hedata/dabi:v001



# Alpha
- one file lies on the server and is known in one collection ( import at server start )
- the bot knows already about this
- the bot tells the serve what visual the user wants
- the server sends the script generating the visual with the visual data anad the bot data to the client
- the client gets a kernel and starts the notebook and only shows notebook output


#fix inotify shit
echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
