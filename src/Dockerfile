FROM node:14-buster
WORKDIR /usr/src
COPY package.json package-lock.json ./
RUN npm clean-install
COPY ./ ./
CMD ["node", "./main.js"]