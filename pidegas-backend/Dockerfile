FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache curl
RUN addgroup -S pidegas && adduser -S pidegas -G pidegas
USER pidegas

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
