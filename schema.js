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
}

type Mutation {
  createLivre(titre: String!, genre: String!, auteur: String!): Livre
  # Ajouter d'autres mutations au besoin
}
`;

module.exports = typeDefs;
