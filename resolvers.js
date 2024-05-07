// resolvers.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger le fichier proto pour le service de livre
const livreProtoPath = 'livre.proto';
const livreProtoDefinition = protoLoader.loadSync(livreProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const livreProto = grpc.loadPackageDefinition(livreProtoDefinition).livre;

// Charger le fichier proto pour le service d'auteur
const auteurProtoPath = 'auteur.proto';
const auteurProtoDefinition = protoLoader.loadSync(auteurProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const auteurProto = grpc.loadPackageDefinition(auteurProtoDefinition).auteur;

// Définir les résolveurs pour les requêtes GraphQL
const resolvers = {
  Query: {
    livre: (_, { id }) => {
      // Effectuer un appel gRPC au microservice de livres
      const client = new livreProto.LivreService('localhost:50051', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.getLivre({ livreId: id }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.livre);
          }
        });
      });
    },
    livres: () => {
      // Effectuer un appel gRPC au microservice de livres
      const client = new livreProto.LivreService('localhost:50051', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.searchLivres({}, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.livres);
          }
        });
      });
    },
    auteur: (_, { id }) => {
      // Effectuer un appel gRPC au microservice d'auteurs
      const client = new auteurProto.AuteurService('localhost:50053', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.getAuteur({ auteurId: id }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.auteur);
          }
        });
      });
    },
    auteurs: () => {
      // Effectuer un appel gRPC au microservice d'auteurs
      const client = new auteurProto.AuteurService('localhost:50053', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.searchAuteurs({}, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.auteurs);
          }
        });
      });
    },
  },
  Mutation: {
    createLivre: (_, { titre, genre, auteur }) => {
      // Effectuer un appel gRPC au microservice de livres pour créer un nouveau livre
      const client = new livreProto.LivreService('localhost:50051', grpc.credentials.createInsecure());
      return new Promise((resolve, reject) => {
        client.createLivre({ titre, genre, auteur }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.livre);
          }
        });
      });
    },
  },
};

module.exports = resolvers;
