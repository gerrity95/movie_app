FROM node:21-alpine as build

# RUN apk add g++ make py3-pip

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

RUN mkdir -p /var/log/auth_backend && chown -R node:node /var/log/auth_backend

WORKDIR /home/node/app

COPY package*.json ./

RUN chown node:node package*.json

# # Install python/pip
# ENV PYTHONUNBUFFERED=1
# RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
# RUN python3 -m ensurepip
# RUN pip3 install --no-cache --upgrade pip setuptools

USER node

RUN npm install

COPY --chown=node:node . .


FROM node:21-alpine as main

WORKDIR /home/node/app

COPY --chown=node:node --from=build /home/node/app .

COPY --chown=node:node --from=build /home/node/app .
