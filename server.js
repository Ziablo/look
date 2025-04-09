const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

// Route pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});

// Stockage des connexions WebSocket
const clients = new Set();

// Configuration du serveur WebSocket avec le même serveur HTTP
const server = app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});

// WebSocket server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Nouvelle connexion WebSocket');
    ws.on('close', () => clients.delete(ws));
});

// Endpoint pour recevoir les webhooks Twitch
app.post('/webhook', (req, res) => {
    const message = req.body;
    console.log('Webhook reçu:', message);
    
    // Vérifier si c'est un événement de souscription
    if (message.subscription && message.subscription.status === 'active') {
        // Ajouter 2 minutes 30 (150 secondes)
        const timeToAdd = 150;
        
        // Envoyer à tous les clients connectés
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'addTime', seconds: timeToAdd }));
            }
        });
    }
    
    res.sendStatus(200);
}); 