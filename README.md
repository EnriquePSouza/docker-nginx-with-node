# Full Cycle Challenge: Nginx with Node

## Project Description

Create a docker compose with nginx, node and mysql, to make a reverse proxy with nginx to access a node server to insert a register in a database mysql and display a message followed by the database list of registers in the browser page.

## Build 

```
docker-compose up -d --build
```

## Docker Compose

```
version: '3'

services:

  nginx:
    build:
      context: nginx
      dockerfile: Dockerfile.prod
    image: enriqueps/nginx:prod
    container_name: nginx
    entrypoint: wait-for app:3000 -t 20 -- nginx -g 'daemon off;'
    networks:
      - network
    ports:
      - "8080:80"
    depends_on:
      - app

  app:
    build:
      context: node
      dockerfile: Dockerfile.prod
    container_name: app
    entrypoint: wait-for db:3306 -t 20 -- ./docker-entrypoint.sh
    networks:
      - network
    volumes:
      - ./node:/usr/src/app
    tty: true
    ports:
      - "3000:3000"
    depends_on:
      - db

  db:
    image: mysql:5.7
    command: --innodb-use-native-aio=0
    container_name: db
    restart: always
    tty: true
    volumes:
      - ./mysql:/var/lib/mysql
    environment:
      - MYSQL_DATABASE=nodedb
      - MYSQL_ROOT_PASSWORD=root
    networks:
      - network

networks:
  network:
    driver: bridge
```

## Nginx Reverse Proxy Config 

```
server{
    listen 80;
    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://app:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";        
        proxy_set_header Host $host;
    }
}
```

## Node Index Page

```
const express = require('express')
const app = express()
const port = 3000
const config = {
    host: 'db',
    user: 'root',
    password: 'root'
};
const mysql = require('mysql')
const connection = mysql.createConnection(config)

const sqlUse = "use nodedb"
connection.query(sqlUse)

const sqlPeople = "CREATE TABLE IF NOT EXISTS people (id int not null auto_increment, name varchar(255), primary key(id));"
connection.query(sqlPeople)

const sqlRegister = "INSERT INTO people(name) values('Enrique Souza')"
connection.query(sqlRegister)

app.get('/', (req, res) => {
    const sqlSelect = "SELECT * FROM people";
    connection.query(sqlSelect, (err, rows) => {
        if (err) {
            res.send('<h1>Error fetching records from database.</h1>');
            return;
        }

        let namesList = '<ul>';
        rows.forEach(row => {
            namesList += `<li>${row.name}</li>`;
        });
        namesList += '</ul>';

        res.send(`
            <h1>Full Cycle Rocks!</h1>
            <h2>List of registered names in database:</h2>
            ${namesList}
        `);
    });
});

app.listen(port, ()=> {
    console.log('Running at ' + port)
})
```

## Node Dockerfile to utilize wait-for-it

```
FROM node:18

# WAIT-FOR-IT - START.

RUN apt update && \
    apt install -y wget netcat-traditional && \
    wget -q -O /usr/bin/wait-for https://raw.githubusercontent.com/eficode/wait-for/v2.2.3/wait-for && \
    chmod +x /usr/bin/wait-for

# WAIT-FOR-IT - END.

WORKDIR /usr/src/app
```

## Node docker-entrypoint.sh to install modules and start server

```
# Settings or startup commands before starting the Node.js
echo "Setting up the environment..."
npm install

# Iniciando o serviço Node.js
echo "Starting node server..."
node index.js
```