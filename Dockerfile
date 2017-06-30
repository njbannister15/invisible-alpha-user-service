FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 3000

CMD [ "npm", "start" ]


# docker run --env MONGO_HOST=mongo.invisible-alpha.com --env MONGO_PORT=27017 --env MONGO_DB=accounts --env PORT=3000 --env MONGO_USER=docker --env MONGO_PASSWORD=htN78Hy6jkP9aJre --env SECRET=I59rxp6PMMSfp7PA3YtjzUygutYlUH7QubK1yU4P936bw92SjHhgxgqJNypu9437 -p 3000:3000 -d invisible-alpha/user-auth 
