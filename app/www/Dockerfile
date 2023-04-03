FROM node:current-buster-slim

RUN mkdir -p /app

WORKDIR /app
COPY . .

RUN yarn

EXPOSE 80
CMD [ "node", "app.js" ]
