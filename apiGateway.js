const express = require('express');
const bodyParser = require('body-parser');
const { ApolloServer } = require('apollo-server-express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');

// MongoDB Livre model
const Livre = require('./models/Livre');

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

        // Create a new instance of Livre
        const newLivre = new Livre({ titre, genre, auteur });

        // Save the book in MongoDB
        const savedLivre = await newLivre.save();

        console.log('Livre enregistré dans MongoDB:', savedLivre);

        // Create a gRPC client for LivreService
        const client = new livreProto.LivreService('localhost:50051', grpc.credentials.createInsecure());

        // Make gRPC call to create a livre
        client.createLivre({ titre, genre, auteur }, (err, response) => {
            if (err) {
                console.error('Erreur lors de l\'appel gRPC:', err);
                res.status(500).json({ error: err.message });
            } else {
                console.log('Livre enregistré dans le service gRPC:', response.livre);
                res.status(201).json(response.livre);
            }
        });
    } catch (err) {
        console.error('Erreur lors de la création du livre:', err);
        res.status(500).json({ error: err.message });
    }
});

// REST endpoint for retrieving all livres
app.get('/livres', async (req, res) => {
    try {
        // Retrieve all books from MongoDB
        const livres = await Livre.find();

        console.log('Livres récupérés depuis MongoDB:', livres);

        res.status(200).json(livres);
    } catch (err) {
        console.error('Erreur lors de la récupération des livres:', err);
        res.status(500).json({ error: err.message });
    }
});

// REST endpoint for deleting a livre by id
app.delete('/livres/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the book from MongoDB
        const deletedLivre = await Livre.findByIdAndDelete(id);

        if (!deletedLivre) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }

        console.log('Livre supprimé avec succès:', deletedLivre);

        // Make a gRPC call to delete the livre in the gRPC service
        const client = new livreProto.LivreService('localhost:50051', grpc.credentials.createInsecure());
        client.deleteLivre({ id }, (err, response) => {
            if (err) {
                console.error('Erreur lors de l\'appel gRPC pour supprimer le livre:', err);
                res.status(500).json({ error: err.message });
            } else {
                console.log('Livre supprimé dans le service gRPC:', response);
                res.status(200).json({ message: 'Livre supprimé avec succès' });
            }
        });
    } catch (err) {
        console.error('Erreur lors de la suppression du livre:', err);
        res.status(500).json({ error: err.message });
    }
});

// REST endpoint for updating a livre by id
app.put('/livres/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titre, genre, auteur } = req.body;

        // Update the book in MongoDB
        const updatedLivre = await Livre.findByIdAndUpdate(id, { titre, genre, auteur }, { new: true });

        if (!updatedLivre) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }

        console.log('Livre mis à jour avec succès dans MongoDB:', updatedLivre);

        // Make a gRPC call to update the livre in the gRPC service
        const client = new livreProto.LivreService('localhost:50051', grpc.credentials.createInsecure());
        client.updateLivre({ id, titre, genre, auteur }, (err, response) => {
            if (err) {
                console.error('Erreur lors de l\'appel gRPC pour mettre à jour le livre:', err);
                res.status(500).json({ error: err.message });
            } else {
                console.log('Livre mis à jour dans le service gRPC:', response.livre);
                res.status(200).json(response.livre);
            }
        });
    } catch (err) {
        console.error('Erreur lors de la mise à jour du livre:', err);
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
