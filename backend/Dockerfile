FROM mcr.microsoft.com/playwright:v1.57.0-noble

WORKDIR /app

COPY . .
RUN npm install

RUN npm run build

CMD ["npm", "run", "start"]