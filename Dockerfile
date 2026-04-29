# Étape 1: Construction (builder)
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copier les fichiers Maven wrapper (chemins corrigés)
COPY backend/mvnw ./mvnw
COPY backend/mvnw.cmd ./mvnw.cmd
COPY backend/.mvn ./.mvn
COPY backend/pom.xml ./pom.xml

# Rendre mvnw exécutable
RUN chmod +x mvnw

# Télécharger les dépendances
RUN ./mvnw dependency:go-offline -B

# Copier le code source
COPY backend/src ./src

# Compiler le JAR
RUN ./mvnw clean package -DskipTests

# Étape 2: Image finale
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copier le JAR depuis l'étape builder
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]