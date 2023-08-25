// configure access to .env file; default config is to look for .env file in root directory: { path: './.env' }
require('dotenv').config();
const express = require("express");
const port = process.env.PORT || 3000;
const app = express();

const cors = require("cors");
app.use(cors());

const axios = require('axios');
const basePlantSearchUrl = "https://trefle.io/api/v1/plants/search";
const authorizedPlantSearchUrl = `${basePlantSearchUrl}?token=${process.env.TREFLE_TOKEN}`;
// const plantSearchUrl = `${basePlantSearchUrl}?token=EAzYEv1GVewf8OND31CcF5U2c2DMHG0N1JPUKuFnrWA`;

app.get('/', (req, res) => {
    res.send('Welcome to the Plant API!')
});

app.get('/search', (req, res) => {
    console.log(req.query);
    if (req.query.q === undefined || req.query.q === '') {
        res.status(400).send('Bad Request. Please enter a valid query');
    }
    axios.get(authorizedPlantSearchUrl, {
        params: {
            q: req.query.q,
        }
    })
    .then(response => {
        console.log("received response from Trefle API");
        res.json(response.data);
    })
    .catch(error => {
        console.log(error);
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})