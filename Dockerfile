# Étape 1: Construction (builder)
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Installer Maven
RUN apk add --no-cache maven

# Copier pom.xml d'abord (pour le caching)
COPY backend/pom.xml .

# Télécharger les dépendances
RUN mvn dependency:go-offline -B

# Copier le code source
COPY backend/src ./src

# Compiler le JAR
RUN mvn clean package -DskipTests

# Étape 2: Image finale
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copier le JAR depuis l'étape builder
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]