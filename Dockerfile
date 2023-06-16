FROM node:18-alpine

RUN apk update && apk upgrade && \
  apk add --update git && \
  apk add --update openssh && \
  apk add --update bash

WORKDIR /usr/src/app

COPY . .

WORKDIR /usr/src/app/server

RUN npm install

WORKDIR /usr/src/app/frontend

RUN npm install

WORKDIR /usr/src/app

CMD cd ./frontend && npm run dev & cd ./server && npm run dev