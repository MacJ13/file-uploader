FROM node:18 AS builder


WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

COPY prisma ./prisma

RUN npm install

COPY . . 

RUN npm run build

FROM node:18 AS production

WORKDIR /app

ENV NODE_ENV=production

COPY ["package.json", "package-lock.json", "./"]
COPY prisma ./prisma

RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/views ./dist/views
COPY --from=builder /app/generated ./generated 

EXPOSE 8000

CMD ["node", "dist/app.js"]