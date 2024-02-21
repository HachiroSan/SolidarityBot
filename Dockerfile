FROM node:latest
WORKDIR /app
COPY . /app/
RUN npm install
CMD cd src && node tele.js