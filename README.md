# Reboting

##Dev Server
npm run server

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

echo "stopping and removing old containers"
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)


docker run --network="host" --name rebotting -v /var/thrive_dev/data_mongo:/data/db -d mongo:latest
docker run --network="host" -d -v /home/hedata/dev/reboting/uploaded_data:/home/jovyan/work  hedata/dabi:v001 start-notebook.sh --NotebookApp.token='' --NotebookApp.allow_origin="*"
docker run --network="host" -v /home/hedata/dev/reboting/dev_config/nginx.conf:/etc/nginx/nginx.conf:ro -d nginx

docker push hedata/dabi:v001

# Alpha
- one file lies on the server and is known in one collection ( import at server start )
- the bot knows already about this
- the bot tells the serve what visual the user wants
- the server sends the script generating the visual with the visual data anad the bot data to the client
- the client gets a kernel and starts the notebook and only shows notebook output


#Todo for executing and showing notebooks
- h
