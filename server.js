const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// Stockage des connexions WebSocket
const clients = new Set();

// WebSocket server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });

wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
});

// Endpoint pour recevoir les webhooks Twitch
app.post('/webhook', (req, res) => {
    const message = req.body;
    
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

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
}); 