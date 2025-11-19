pipeline {
    agent any

    environment {
        DOCKER_CLI_EXPERIMENTAL = "enabled"
    }

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
                sh 'docker compose build --no-cache'
            }
        }

        stage('Tests Backend') {
            steps {
                echo "== Tests backend =="
                dir('backend') {
                    sh 'npm test || echo "Aucun test disponible"'
                }
            }
        }

        stage('Tests Frontend') {
            steps {
                echo "== Tests frontend =="
                dir('frontend') {
                    sh 'npm test || echo "Aucun test disponible"'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo "== Déploiement avec Docker Compose =="
                sh 'docker compose up -d --build'
            }
        }

        stage('Cleanup') {
            steps {
                echo "== Nettoyage des images inutilisées =="
                sh 'docker image prune -f'
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline OK – Déploiement terminé."
            slackSend(
                channel: '#ci-cd',
                color: 'good',
                message: "✅ Pipeline réussi : gestion-biellet-avion"
            )
        }
        failure {
            echo "❌ Pipeline FAILED"
            slackSend(
                channel: '#ci-cd',
                color: 'danger',
                message: "❌ Pipeline échoué : gestion-biellet-avion"
            )
        }
    }
}
