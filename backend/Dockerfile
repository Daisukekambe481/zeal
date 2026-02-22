FROM node:20-alpine

WORKDIR /app

# so npm install only re-runs when dependencies change
COPY package.json package-lock.json ./
RUN npm install

# Copy source after deps are installed
COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]