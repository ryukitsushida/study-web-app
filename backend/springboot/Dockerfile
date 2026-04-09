FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY gradle gradle
COPY gradlew build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN adduser -D -u 1000 appuser
COPY --from=build /app/build/libs/*.jar app.jar
RUN chown -R appuser:appuser /app
USER appuser
RUN apk add --no-cache wget
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8002/health || exit 1
EXPOSE 8002
ENTRYPOINT ["java", "-jar", "app.jar"]
