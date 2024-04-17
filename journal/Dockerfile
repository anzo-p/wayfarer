FROM node:20 as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev
RUN npm cache clean --force
RUN npm install typescript

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/config.js ./

EXPOSE 3001

CMD ["node", "dist/main"]
