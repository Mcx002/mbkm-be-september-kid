FROM node:18.12.0-alpine

WORKDIR /usr/src/app

# Copy nodejs package manifest
COPY package.json package-lock.json .swcrc ./
COPY ecosystem.config.js.development.stub ./

# Copy application sources
COPY tsconfig.json ./
COPY src/ ./src

RUN npm install
RUN npm run build

CMD ["node", "dist/bootstrap.js"]