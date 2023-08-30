// Configure access to .env file; default config is to look for .env file in root directory: { path: './.env' }
require('dotenv').config();
const express = require("express");
const port = process.env.PORT || 3000;
const app = express();

const cors = require("cors");
app.use(cors());

// app.use(express.static('public'));

// Trefle Client
const TreffleClient = require('./clients/trefleClient');
const trefleClient = new TreffleClient(process.env.TREFLE_BASE_URL, process.env.TREFLE_TOKEN);


app.get('/', (req, res) => {
    res.send('Welcome to the Plant API!')
});

app.get('/search', (req, res) => {
    console.log(req.query);
    if (req.query.q === undefined || req.query.q === '') {
        res.status(400).send('Bad Request. Please enter a valid query');
    }
    trefleClient.searchPlants(req.query.q, req.query.page)
    .then(response => {
        console.log("received response data: ", response.data !== undefined);
        response.data && res.json(response)
    })
    .catch(error => {
        console.log("received error: ", error.config);
        res.status(500).send(error)
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})