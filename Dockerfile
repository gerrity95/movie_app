FROM node:14-alpine as build

# RUN apk add g++ make py3-pip

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

RUN mkdir -p /var/log/fmovies && chown -R node:node /var/log/fmovies

WORKDIR /home/node/app

COPY package*.json ./

# # Install python/pip
# ENV PYTHONUNBUFFERED=1
# RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
# RUN python3 -m ensurepip
# RUN pip3 install --no-cache --upgrade pip setuptools

USER node

RUN npm install

FROM node:14-alpine as main

WORKDIR /home/node/app

COPY --chown=node:node --from=build /home/node/app .

#EXPOSE 8080

#CMD ["pm2-runtime", "process.yml"]