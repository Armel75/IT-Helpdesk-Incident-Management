# Multi-stage Dockerfile for Spring Boot 3.4 / Java 21 Backend
# Stage 1: Build & Package
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Pre-fetch dependencies to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal, Non-Root Production Runtime
FROM eclipse-temurin:21-jre-alpine AS runtime

# Create an unprivileged user and group (least privilege)
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy executable jar from builder
COPY --from=builder --chown=spring:spring /build/target/helpdesk-backend-*.jar app.jar

USER spring:spring

EXPOSE 8080

# Configure JVM ergonomics for container environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
