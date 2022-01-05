# movie_app

Steps to start the app:

Clone down repo and checkout the appropriate branch: 

```
git clone https://github.com/gerrity95/movie_app.git

git checkout linux_startup
```

Install node packages:

```
cd movie_app

npm install
```

The master repo uses docker images specific to the Rasberry Pi architecture. You need to update the following in the docker compose:

*Please note* if on the linux_startup branch this should already be done

```
Update
Line 61 -> 
From
image: andresvidal/rpi3-mongodb3
To
image: mongo:4.1.8-xenial

Line 74 ->
From
image: ind3x/rpi-mongo-express
To:
image: mongo-express
```


In the root directory create the following files that are in the .gitignore:

```
.env
```

In the `python_backend` create the following files:

```
.env
env_config.py
```

Run a docker build from the root directory

```
docker-compose build
```

Assuming all goes well, start up the containers:

```
docker-compose up
```

Access the app on port 3000:

```
http://<ip_address>:3000
```

All other acess points (login details can be found in .env file)

MongoDB:http://<ip_address>:8081 

RabbitMQ: http://<ip_address>:15672
