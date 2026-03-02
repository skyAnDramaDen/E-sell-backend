FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --only=production


COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/server.js"]


#FROM node:20-alpine
#
#WORKDIR /app
#
#RUN apk add --no-cache openssl
#
#COPY package*.json ./
#
#RUN npm install
#
#COPY . .
#
#RUN npx prisma generate
#
#EXPOSE 3000
#
##CMD ["npm", "run", "dev"]
#
##CMD ["node", "backend/src/server.js"]
#
##installed tsx globally to run typescript directly and then i could see the server file in src. had node errors
#RUN npm install tsx --global
#
#CMD ["tsx", "src/server.ts"]