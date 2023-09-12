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

// Response Models
const PlantsResponse = require("./apiModels/plantsResponse");

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

const USER_PAGE_LIMIT = 5;

// Users
app.get('/users', (req, res) => {
    // TODO: add pagination using cursor query.. but figure out how to maintain pagingation cursor for client
    //      redis cache to save cursor position related to a page number and allow client to pass search query id + page?
    //      Or just have user pass last cursor...
    //      getPaginatedResults(cursor, pageSize).then((results) => {
    //   console.log('Page 1:', results);
    //   const lastCursor = results[results.length - 1]._id;

    //   // To get the next page, use the last cursor from the previous page
    //   getPaginatedResults(lastCursor, pageSize).then((nextPageResults) => {
    //     console.log('Page 2:', nextPageResults);
    //   });
    // query = { _id: { $gt: cursor } }; // Assuming _id is used as the cursor
    User.find().sort({lastName: 1, firstName: 1}).limit(USER_PAGE_LIMIT)
    .then(users => res.json(users))
    .catch(error => res.status(500).send(error));
});

app.get('/users/find', (req, res) => {
    const email = req.query.email;
    if (email) {
        User.find({ email: email })
        .then(users => {
            if (users.length === 0) {
                res.status(404).send({ error: 'User not found' });
            } else if (users.length > 1) {
                res.status(500).send({ error: 'Multiple users found' });
            }
            res.json(users[0]);
        })
        .catch(error => {
            console.log("Received user search error: ", error);
            res.status(500).send(error)
        });
    } else {
        res.status(400).send({ error: 'Missing email query parameter' });
    }
})
            
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

app.get('/plants', (req, res) => {
    Plant.countDocuments()
    .then(count => {
        Plant.find() // .sort({scientificName: 1}).limit(PlantsResponse.UI_PER_PAGE)
        .then(plants => {
            const response = PlantsResponse.fromDbResponse(plants, count);
            res.send(response);
        })
        .catch(error => {
            console.log("Received plant error: ", error);
            res.status(500).send("Error getting plants")
        });
    })
    .catch(e => {
        console.log("Received plant count error: ", e);
        res.status(500).send("Error getting plants.")
    })
});

app.get('/plants/:plantId', (req, res) => {
    Plant.find({_id: req.params.plantId})
    .then(users => res.json(users))
    .catch(error => res.status(500).send(error));
});

app.delete('/plants/:plantId', (req, res) => {
    Plant.findByIdAndDelete(req.params.plantId)
    .then(plant => res.status(200).json(plant))
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
        console.log("Received garden create error:", error)
        res.status(400).json({ error: 'Invalid garden' });
    }
    garden.save()
    .then(garden => res.status(201).json(garden))
    .catch(error => {
        console.log("Received garden save error:", error)
        res.status(400).send(error);
    });
});

app.delete('/gardens/:gardenId', (req, res) => {
    Garden.findByIdAndDelete(req.params.gardenId)
    .then(() => res.status(201))
    .catch(error => res.status(400).json(error));
});

// Plants in Garden
app.get('/gardens/:gardenId/plants', (req, res) => {
    console.log('Get plants by gardenId:', req.params.gardenId);
    Garden.findById(req.params.gardenId)
    .populate('plants')
    .then(garden => res.json(garden))
    .catch(error => res.status(500).json(error));
});

app.post('/gardens/:gardenId/plants', async (req, res) => {
    // Check if plants already exist in DB
    Plant.exists({refId: req.body.refId})
    .then(existingPlant => {
        if (existingPlant) {
            console.log("Plant already exists in DB:", existingPlant);
            // Add existing plant to garden
            Garden.findByIdAndUpdate(req.params.gardenId, {
                $push: { plants: existingPlant._id }
            })
            .then((response) => res.status(200).json(response))
            .catch(error => res.status(400).json({ error }));
        } else {
            // Plant does not exist in DB; save plant to DB
            const plantInfo = {...req.body, infoUrls: PerenualClient.createInfoUrls(req.body.refId)};
            const newPlant = new Plant(plantInfo);
            console.log("Plant does not exist in DB; Saving plant to DB:", newPlant);
            newPlant.save()
                .then(plant => {
                    console.log("Plant saved to DB:", plant);
                    // Add new plant to garden
                    Garden.findByIdAndUpdate(req.params.gardenId, {
                        $push: { plants: plant._id }
                    })
                    .then((response) => res.status(200).json(response))
                    .catch(error => res.status(400).json({ error }));
                })
                // Save failed, could be due to validation or server error
                // TODO: figure out how to distinguish between validation and server error
                .catch(error => res.status(400).json({ error }));
        }
    })
    // Find failed, could be due to invalid ID or server error
    .catch(error => res.status(400).json({ error }));
});

app.delete('/gardens/:gardenId/plants/:plantId', (req, res) => {
    Garden.updateOne(
        { _id: req.params.gardenId },
        { $pull: { plants: req.params.plantId } }
    )
    .then((result) => res.status(201))
    .catch(error => res.status(400).json(error));
});

// Catch-all route for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
