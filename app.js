// Configure access to .env file; default config is to look for .env file in root directory: { path: './.env' }
require('dotenv').config();
const port = process.env.PORT || 3000;

// Express
const express = require("express");
const app = express();
// For parsing application/json
app.use(express.json()) 

// Mongoose to access MongoDB
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true,       // Use new URL parser
    useUnifiedTopology: true   // Use new server discovery and monitoring engine
});

// Connect our database via mongoose's connection method
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => { console.log("MongoDB connected successfully") });

// Schemas
const User = require("./dbModels/user");
const Plant = require("./dbModels/plant");
const Garden = require("./dbModels/garden");

// CORS
const cors = require("cors");
app.use(cors());

// External/Upstream Clients
const TreffleClient = require('./clients/trefleClient');
const trefleClient = new TreffleClient(process.env.TREFLE_BASE_URL, process.env.TREFLE_TOKEN);
const PerenualClient = require('./clients/perenualClient');
const perenualClient = new PerenualClient(process.env.PERENUAL_BASE_URL, process.env.PERENUAL_KEY);

app.get('/', (req, res) => {
    res.send('Welcome to the Plant API!')
});

// Users
app.get('/users', (req, res) => {
    User.find()
    .then(users => res.json(users))
    .catch(error => res.status(500).send(error));
});
            
app.post('/users', (req, res) => {
    const user = new User(req.body);
    user.save()
    .then(user => res.status(201).json(user))
    .catch(error => res.status(400).send(error));
});

// Plants
app.get('/search', (req, res) => {
    perenualClient.searchPlants(req.query.q, req.query.page)
    .then(response => {
        console.log("Received search data: ", response.data !== undefined);
        response.data && res.json(response)
    })
    .catch(error => {
        console.log("Received search error: ", error);
        res.status(500).send(error)
    });
});

app.post('/plants', (req, res) => {
    const plant = new Plant(req.body);
    // TODO: check if plant already in DB
    plant.save()
    .then(plant => res.status(201).json(plant))
    .catch(error => res.status(500).send(error));
});

// Gardens
app.get('/gardens/users/:userId', (req, res) => {
    let userId = '';
    try {
        userId = new mongoose.Types.ObjectId(req.params.userId);
    } catch(error) {
        console.log("Received garden search error:", error)
        res.status(400).json({ error: 'Invalid user ID' });
    }
    console.log('userId:', userId);
    Garden.find({
        user: userId
    })
    .then(gardens => res.json(gardens))
    .catch(error => res.status(500).json(error));
});

app.post('/gardens/users', (req, res) => {
    let garden = {};
    try {
     garden = new Garden(req.body);
    } catch(error) {
        console.log("Received garden search error:", error)
        res.status(400).json({ error: 'Invalid garden' });
    }
    garden.save()
    .then(garden => res.status(201).json(garden))
    .catch(error => res.status(400).send(error));
});

app.delete('/gardens/:gardenId', (req, res) => {
    Garden.findByIdAndDelete(req.params.gardenId)
    .then(() => res.status(200))
    .catch(error => res.status(400).json(error));
});

// Catch-all route for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})