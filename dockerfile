FROM node:18.12.1-bullseye-slim

ARG DIST_FILE
ARG NODE_MODULES

WORKDIR /app
COPY ${NODE_MODULES} /app/node_modules/
COPY ${DIST_FILE} /app/

CMD node src/smartNotes
