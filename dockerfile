FROM node:18.12.1-bullseye-slim

ARG BOT_NAME

COPY . .
RUN npm install
RUN npm run build

WORKDIR /app
COPY node_modules /app/node_modules/
COPY dist /app/

CMD node src/${BOT_NAME}
