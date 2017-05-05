FROM node:latest

# prepare a user which runs everything locally! - required in child images!
RUN useradd --user-group --create-home --shell /bin/false app

RUN npm install -g nodemon
RUN npm install -g @angular/cli && npm cache clean

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY . /usr/src/app/

CMD ["npm","run","server:docker"]
EXPOSE 3000
