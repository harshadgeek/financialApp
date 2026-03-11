FROM gradle:8.6.0-jdk21-alpine AS build
WORKDIR /app
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY src src
RUN gradle build -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN mkdir -p uploads/profile-pictures
COPY --from=build /app/build/libs/financial-app-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
