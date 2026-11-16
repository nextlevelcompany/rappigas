# Stage 1: Build Backend (Spring Boot)
FROM maven:3.9.9-eclipse-temurin-21 AS backend-builder
WORKDIR /backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B || true
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Build Frontend (Next.js)
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner (Production)
FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache nodejs npm curl bash
WORKDIR /app

# Copy Backend jar
COPY --from=backend-builder /backend/target/*.jar /app/backend.jar

# Copy Frontend files
WORKDIR /app/frontend
COPY --from=frontend-builder /frontend/public ./public
COPY --from=frontend-builder /frontend/.next ./.next
COPY --from=frontend-builder /frontend/node_modules ./node_modules
COPY --from=frontend-builder /frontend/package.json ./package.json

WORKDIR /app
EXPOSE 3000 8080
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "java -jar /app/backend.jar & cd /app/frontend && npm start"]
