FROM openjdk:8-alpine
MAINTAINER nfe-w <nfe-w@outlook.com>

EXPOSE 8234

ARG JAR_FILE
ADD target/${JAR_FILE} app.jar

CMD ["java", "-jar", "/app.jar"]