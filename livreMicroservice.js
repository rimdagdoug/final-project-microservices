const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Kafka } = require('kafkajs');

// Charger le fichier livre.proto
const livreProtoPath = 'livre.proto';
const livreProtoDefinition = protoLoader.loadSync(livreProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const livreProto = grpc.loadPackageDefinition(livreProtoDefinition).livre;

// Configuration du client Kafka
const kafka = new Kafka({
  clientId: 'livre-service',
  brokers: ['localhost:9092']
});

// Création d'un producteur Kafka
const producer = kafka.producer();

// Fonction pour envoyer un message au topic Kafka
const sendMessage = async (topic, message) => {
  try {
    await producer.send({
      topic,
      messages: [
        { value: JSON.stringify(message) }
      ]
    });
    console.log('Message Kafka envoyé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message Kafka:', error);
  }
};

// Connexion du producteur Kafka
const connectProducer = async () => {
  await producer.connect();
  console.log('Producteur Kafka connecté');
};

// Déconnexion du producteur Kafka
const disconnectProducer = async () => {
  await producer.disconnect();
  console.log('Producteur Kafka déconnecté');
};

let identifiant = 0;

// Implémenter le service livre
const livreService = {
  getLivre: (call, callback) => {
    // Récupérer les détails du livre à partir de la base de données
    const livre = {
      id: call.request.livre_id,
      titre: 'Exemple de livre',
      genre: 'Fiction',
      auteur: 'Auteur Inconnu',
      // Ajouter d'autres champs de données pour le livre au besoin
    };
    callback(null, { livre });
  },
  searchLivres: (call, callback) => {
    const { query } = call.request;
    // Effectuer une recherche de livres en fonction de la requête
    // Ici, vous devriez implémenter la logique de recherche réelle
    // et renvoyer les résultats sous forme de liste de livres
    const livres = [
      {
        id: '1',
        titre: 'Exemple de livre 1',
        genre: 'Fiction',
        auteur: 'Auteur Inconnu',
      },
      {
        id: '2',
        titre: 'Exemple de livre 2',
        genre: 'Non-fiction',
        auteur: 'Auteur Inconnu',
      },
      // Ajouter d'autres résultats de recherche de livres au besoin
    ];
    callback(null, { livres });
  },
  createLivre: async (call, callback) => {
    const { titre, genre, auteur } = call.request;
    // Créer un nouveau livre dans la base de données ou effectuer toute autre opération nécessaire
    const livre = {
      id: identifiant,
      titre,
      genre,
      auteur,
      // Ajouter d'autres champs de données pour le livre au besoin
    };
    identifiant++;
    // Envoyer un message au topic Kafka lors de l'ajout d'un livre
    await sendMessage('livres-topic', livre);
    callback(null, { livre });
  },
  updateLivre: async (call, callback) => {
    const { id, titre, genre, auteur } = call.request;
    // Mettre à jour le livre dans la base de données ou effectuer toute autre opération nécessaire
    const livre = {
      id,
      titre,
      genre,
      auteur,
      // Ajouter d'autres champs de données pour le livre au besoin
    };
    // Envoyer un message au topic Kafka lors de la mise à jour d'un livre
    await sendMessage('livres-topic', livre);
    callback(null, { livre });
  }
};

// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(livreProto.LivreService.service, livreService);

const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Échec de la liaison du serveur:', err);
    return;
  }
  console.log(`Le serveur s'exécute sur le port ${port}`);
  server.start();
  // Connexion du producteur Kafka après le démarrage du serveur
  connectProducer();
});
console.log(`Microservice de livres en cours d'exécution sur le port ${port}`);

// Gestion des signaux de terminaison pour arrêter proprement le serveur et déconnecter le producteur Kafka
process.on('SIGINT', async () => {
  console.log('Signal d\'interruption reçu, arrêt du serveur...');
  await server.tryShutdown(() => {
    console.log('Serveur arrêté');
  });
  await disconnectProducer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Signal de terminaison reçu, arrêt du serveur...');
  await server.tryShutdown(() => {
    console.log('Serveur arrêté');
  });
  await disconnectProducer();
  process.exit(0);
});
