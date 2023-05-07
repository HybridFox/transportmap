FROM node:hydrogen-alpine as builder

RUN apk add --no-cache python3 build-base

ENV NODE_ENV build

USER node
WORKDIR /home/node

COPY --chown=node:node . /home/node

RUN ls

RUN npm ci \
    && npm run nx run api:build

# ---

FROM node:hydrogen-alpine

# RUN apk add --update --no-cache python3 gcc make automake autoconf g++ vips vips-dev
ENV NODE_ENV production

EXPOSE 80
USER root
RUN apk add libcap && setcap CAP_NET_BIND_SERVICE=+eip /usr/local/bin/node

USER node
WORKDIR /home/node

COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/dist/ /home/node/dist/
COPY --from=builder /home/node/static/ /home/node/static/

USER root
RUN mkdir /home/node/dist/tmp
RUN chown node:node /home/node/dist/tmp
USER node

RUN npm ci

CMD ["node", "dist/apps/api/main.js"]
