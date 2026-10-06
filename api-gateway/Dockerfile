# Multi-stage build for API Gateway
FROM maven:3.8.1-openjdk-17-slim AS builder
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /build/target/api-gateway-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8020
ENTRYPOINT ["java", "-jar", "app.jar"]
