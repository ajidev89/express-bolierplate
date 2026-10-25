FROM node:20-alpine

RUN mkdir -p /var/www/html
WORKDIR /var/www/html
COPY . .
ARG DB_PROVIDER=mongodb
ENV DB_PROVIDER=$DB_PROVIDER
RUN npm install
RUN npm run build


# Set environment variables
ENV DATABASE_URL=""
ENV DB_PUSH=false
ENV PORT=8000
ENV TOKEN_DURATION="30m"
ENV TOKEN_SECRET="TestingScraply@2020"
ENV MAIL_HOST=sandbox.smtp.mailtrap.io
ENV MAIL_PORT=2525
ENV MAIL_USERNAME="a62410a30b6607"
ENV MAIL_PASSWORD="db44c762c452b8"

EXPOSE 8000 

CMD ["sh", "-c", "node scripts/use-database.js generate && if [ \"$DB_PUSH\" = \"true\" ]; then node scripts/use-database.js push; fi && npm start"]