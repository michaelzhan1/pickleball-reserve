FROM mcr.microsoft.com/playwright:v1.50.0-noble

WORKDIR /app

COPY . .
RUN npm install

RUN npm run build

CMD ["npm", "run", "start"]