Microservices Livres et Auteurs
Ce projet implémente deux microservices, un pour la gestion des livres et l'autre pour la gestion des auteurs, ainsi qu'une passerelle API GraphQL et REST pour interagir avec ces microservices. Les microservices sont développés en utilisant gRPC pour la communication entre services et MongoDB comme base de données pour stocker les données.

Fonctionnalités:
Microservice Livres (Port 50051) :

Création, mise à jour, suppression et récupération des livres.
Recherche de livres.
Écoute des messages du topic Kafka 'livres-topic' pour les nouvelles publications de livres.
Microservice Auteurs (Port 50053) :

Création, mise à jour, suppression et récupération des auteurs.
Recherche d'auteurs.
Écoute des messages du topic Kafka 'livres-topic' pour les nouvelles publications de livres.
Passerelle API GraphQL (Port 3000) :

Implémente des requêtes et des mutations pour interagir avec les livres et les auteurs via une interface GraphQL.
Utilise Apollo Server pour exposer le schéma GraphQL et résoudre les requêtes avec les microservices.
Fournit également une API REST pour une compatibilité avec les clients REST existants.
Technologies Utilisées
Node.js : Environnement d'exécution pour le backend.
Express.js : Framework web pour la création de l'API REST et la gestion des requêtes HTTP.
gRPC : Système RPC (Remote Procedure Call) pour la communication inter-services.
MongoDB : Base de données NoSQL pour le stockage des données des livres et des auteurs.
Apollo Server : Serveur GraphQL pour la gestion des requêtes et des mutations GraphQL.
KafkaJS : Client Kafka pour la consommation et la publication de messages sur les topics Kafka.
