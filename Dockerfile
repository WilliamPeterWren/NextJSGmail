FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps  # Add the flag here

COPY . .
COPY .env.local .env.local

RUN npm run build

CMD ["npm", "start"]
