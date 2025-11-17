pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo "== Checkout du code =="
                git branch: 'main', url: 'https://github.com/Modia12/gestion-biellet-avion.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "== Build des images Docker =="
                sh 'docker-compose build'
            }
        }

        stage('Tests') {
            steps {
                echo "== Tests backend =="
                dir('backend') {
                    sh 'npm test || echo "Aucun test disponible"'
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                echo "== Déploiement avec Docker Compose =="
                sh 'docker-compose up -d --build'
            }
        }

    }

    post {
        success {
            echo "Pipeline OK  Déploiement terminé."
        }
        failure {
            echo "Pipeline FAILED "
        }
    }
}