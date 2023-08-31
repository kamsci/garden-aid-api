const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema({
    scientificName: {
        type: String,
        maxLength: 100,
        required: true,
    },
    plantImageUrls: [{
        type: Map,
        of: String,
        maxLength: 300,
        required: true,
    }],
    plantInfoUrls: [{
        type: Map,
        of: String,
        maxLength: 300,
        required: true,
    }]
});

const Plant = mongoose.model("Plant", plantSchema);

module.exports = Plant;