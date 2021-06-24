FROM node:10.19.0
#WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
EXPOSE 4000
COPY . .
