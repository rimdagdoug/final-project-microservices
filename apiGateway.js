const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer } = require('apollo-server-express');
const { graphqlHTTP } = require('express-graphql');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');

// MongoDB Movie model
const Movie = require('./models/Livre');

// Load GraphQL type definitions
const typeDefs = require('./schema');

// Load GraphQL resolvers
const resolvers = require('./resolvers');

// Load gRPC proto definitions for LivreService and AuteurService
const livreProtoPath = 'livre.proto';
const auteurProtoPath = 'auteur.proto';
const livreProtoDefinition = protoLoader.loadSync(livreProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const auteurProtoDefinition = protoLoader.loadSync(auteurProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const livreProto = grpc.loadPackageDefinition(livreProtoDefinition).livre;
const auteurProto = grpc.loadPackageDefinition(auteurProtoDefinition).auteur;

// Create Express app
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
const connectToMongoDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/mylivre', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
};

// REST endpoint for creating livres
app.post('/livres', async (req, res) => {
    try {
        const { titre, genre, auteur } = req.body;
   
        // You can perform any necessary validation or transformation here
        
        // Create a gRPC client for LivreService
        const client = new livreProto.LivreService('localhost:50051', grpc.credentials.createInsecure());
        
        // Make gRPC call to create a livre
        client.createLivre({ titre, genre, auteur }, (err, response) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json(response.livre);
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GraphQL server setup
const apolloServer = new ApolloServer({ typeDefs, resolvers });

// Await server.start() before applying middleware
const startApolloServer = async () => {
    try {
        await apolloServer.start();
        apolloServer.applyMiddleware({ app });
    } catch (err) {
        console.error('Error starting Apollo Server:', err);
    }
};

// Start Apollo Server and Express app
const port = 3000;
const startServer = async () => {
    try {
        await connectToMongoDB();
        await startApolloServer();
        app.listen(port, () => {
            console.log(`API Gateway en cours d'exécution sur le port ${port}`);
        });
    } catch (err) {
        console.error('Error starting server:', err);
    }
};

startServer();
