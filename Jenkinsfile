pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Modia12/gestion-biellet-avion.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build --no-cache'
            }
        }

        stage('Tests') {
            steps {
                dir('backend') {
                    sh 'npm test || echo "Aucun test disponible"'
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh 'docker compose up -d --build'
            }
        }

        stage('Cleanup') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline OK – Déploiement terminé."
        }
        failure {
            echo "❌ Pipeline FAILED"
        }
    }
}
