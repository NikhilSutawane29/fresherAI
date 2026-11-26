FROM node

WORKDIR /app

COPY package*json ./

RUN npm install

COPY ./gateway/package*json ./gateway/

RUN npm install

COPY gateway ./gateway

COPY shared ./shared

WORKDIR /app/gateway

EXPOSE 7000

# to run our server 
CMD [ "npm", "start" ]   
