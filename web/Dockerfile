FROM node:16.13.2-alpine
WORKDIR /web

ENV PATH /web/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./
RUN npm install
RUN npm install react-scripts@5.0.1 -g 
COPY . ./
