const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema({
    refId: {
        type: String,
        maxLength: 300,
        required: true,
        unique: true,
    },
    scientificName: {
        type: String,
        maxLength: 100,
        required: true,
        unique: true,
    },
    commonName: {
        type: String,
        maxLength: 100,
    },

    imageUrls: {
        type: Map,
        of: String,
        maxLength: 300,
        required: true,
    },
    infoUrls: [{
        type: Map,
        of: String,
        maxLength: 300,
        required: true,
    }]
}, { strict: true })
.index({ scientificName: 1 });

const Plant = mongoose.model("Plant", plantSchema);

module.exports = Plant;