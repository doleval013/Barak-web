FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Create directory for DB
RUN mkdir -p /data
VOLUME /data

EXPOSE 3000

CMD ["npm", "start"]
