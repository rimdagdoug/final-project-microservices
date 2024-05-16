const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const Livre = require('./models/Livre');

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

const resolvers = {
  Query: {
    // Récupérer un livre par son ID
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
    // Récupérer tous les livres
    // livres: () => {
    //   // Effectuer un appel gRPC au microservice de livres
    //   const client = new livreProto.LivreService('localhost:50051', grpc.credentials.createInsecure());
    //   return new Promise((resolve, reject) => {
    //     client.SearchLivre({}, (err, response) => { // Correction ici
    //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve(response.livres);
    //       }
    //     });
    //   });
    // },
    // Récupérer un auteur par son ID
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
    // Récupérer tous les auteurs
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
    // Créer un nouveau livre
    createLivre: async (_, { titre, genre, auteur }) => {
      // Créez une nouvelle instance de Livre avec les données fournies
      const newLivre = new Livre({ titre, genre, auteur });

      // Enregistrez le livre dans MongoDB
      try {
        await newLivre.save();
        console.log('Livre enregistré dans MongoDB:', newLivre);
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du livre dans MongoDB:', error);
        throw new Error('Erreur lors de l\'enregistrement du livre dans MongoDB');
      }

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
    // Supprimer un livre par son ID
    deleteLivre: async (_, { id }) => {
      // Supprimer le livre correspondant dans la base de données MongoDB
      try {
        await Livre.findByIdAndDelete(id);
        console.log('Livre supprimé avec succès');
        return true;
      } catch (error) {
        console.error('Erreur lors de la suppression du livre dans MongoDB:', error);
        return false;
      }
    },
    // Récupérer tous les livres
    getAllLivres: async () => {
      try {
        console.log('Début de la récupération de tous les livres...');
        const livres = await Livre.find(); // Utiliser Mongoose pour récupérer tous les livres
        console.log('Livres récupérés avec succès:', livres);
        return livres;
      } catch (error) {
        console.error('Erreur lors de la récupération de tous les livres:', error);
        throw new Error('Erreur lors de la récupération de tous les livres');
      }
    },
  },
};

module.exports = resolvers;
