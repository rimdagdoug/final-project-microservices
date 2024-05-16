const gql = require('graphql-tag');

const typeDefs = gql`
type Livre {
  id: String!
  titre: String!
  genre: String!
  auteur: String!
}

type Auteur {
  id: String!
  nom: String!
  nationalite: String!
  # Ajouter d'autres champs de données pour l'auteur au besoin
}

type Query {
  livre(id: String!): Livre
  livres: [Livre]
  auteur(id: String!): Auteur
  auteurs: [Auteur]
  getAllLivres: [Livre]
}

type Mutation {
  createLivre(titre: String!, genre: String!, auteur: String!): Livre
  deleteLivre(id: String!): Boolean
  getAllLivres: [Livre] # Ajout de la mutation pour récupérer tous les livres
}
`;

module.exports = typeDefs;
