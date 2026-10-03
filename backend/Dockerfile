# =========================
# Stage 1: Build application
# =========================
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven configuration
COPY pom.xml .

# Copy source code
COPY src ./src

# Build Spring Boot application
RUN mvn clean package -DskipTests


# =========================
# Stage 2: Run application
# =========================
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the generated JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Render will provide the PORT environment variable
EXPOSE 10000

# Start Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]