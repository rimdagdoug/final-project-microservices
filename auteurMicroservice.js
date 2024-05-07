const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Kafka } = require('kafkajs');

// Charger le fichier auteur.proto
const auteurProtoPath = 'auteur.proto';
const auteurProtoDefinition = protoLoader.loadSync(auteurProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const auteurProto = grpc.loadPackageDefinition(auteurProtoDefinition).auteur;

// Implémenter le service d'auteurs
const auteurService = {
  getAuteur: (call, callback) => {
    // Récupérer les détails de l'auteur à partir de la base de données
    const auteur = {
      id: call.request.auteur_id,
      nom: 'Exemple d\'auteur',
      nationalite: 'Inconnue',
      // Ajouter d'autres champs de données pour l'auteur au besoin
    };
    callback(null, { auteur });
  },
  searchAuteurs: (call, callback) => {
    const { query } = call.request;
    // Effectuer une recherche d'auteurs en fonction de la requête
    const auteurs = [
      {
        id: '1',
        nom: 'Exemple d\'auteur 1',
        nationalite: 'Inconnue',
      },
      {
        id: '2',
        nom: 'Exemple d\'auteur 2',
        nationalite: 'Inconnue',
      },
      // Ajouter d'autres résultats de recherche d'auteurs au besoin
    ];
    callback(null, { auteurs });
  },
  // Ajouter d'autres méthodes au besoin
};

// Créer et démarrer le serveur gRPC
const server = new grpc.Server();
server.addService(auteurProto.AuteurService.service, auteurService);

const port = 50053;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Échec de la liaison du serveur:', err);
    return;
  }
  console.log(`Le serveur s'exécute sur le port ${port}`);
  server.start();
});
console.log(`Microservice d'auteurs en cours d'exécution sur le port ${port}`);

// Consumer Kafka pour écouter les messages du topic 'livres-topic'
const kafka = new Kafka({
  clientId: 'auteur-service',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'auteur-group' });

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'livres-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('received message');
      console.log({
        value: message.value.toString(),
      });
      // Traiter le message reçu du topic Kafka ici
    },
  });
};

runConsumer().catch(console.error);
