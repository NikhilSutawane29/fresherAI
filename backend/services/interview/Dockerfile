
FROM node

WORKDIR /app

COPY package*json ./

RUN npm install

COPY ./services/interview/package*json ./services/interview/

RUN cd services/interview && npm install

COPY services/interview ./services/interview

COPY services/resume ./services/resume

COPY shared ./shared

WORKDIR /app/services/interview

EXPOSE 6003

# to run our server 
CMD [ "npm", "start" ]   
