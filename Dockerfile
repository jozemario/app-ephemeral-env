FROM node:22-alpine

WORKDIR /app

COPY src/package*.json ./
RUN npm install

COPY src/ .

EXPOSE 8080

CMD ["npm", "start"] 