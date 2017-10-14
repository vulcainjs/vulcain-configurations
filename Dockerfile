FROM node:8-slim

RUN npm install gulp -g
EXPOSE 8080

COPY package.json /app/

WORKDIR /app
RUN npm install

HEALTHCHECK --interval=30s --timeout=1s CMD curl -f http://localhost:8080/health || exit 1

ENV VULCAIN_SERVICE_NAME=configurations-service
ENV VULCAIN_SERVICE_VERSION=1.0

COPY tsconfig.json package.json gulpFile.js tslint.json /app/
COPY src /app/src

RUN gulp default

ENTRYPOINT ["node"]
CMD ["dist/index.js"]
