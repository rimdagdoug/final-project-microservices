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
  getAllAuteurs: [Auteur]
 
}

type Mutation {
  createLivre(titre: String!, genre: String!, auteur: String!): Livre
  deleteLivre(id: String!): Boolean
  getAllLivres: [Livre]
  createAuteur(nom: String!, nationalite: String!): Auteur
  getAllAuteurs: [Auteur]
  deleteAuteur(id: String!): Boolean
}

`;

module.exports = typeDefs;
