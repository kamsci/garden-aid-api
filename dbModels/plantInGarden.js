const mongoose = require("mongoose");

const plantInGardenSchema = new mongoose.Schema({
    garden: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Garden",
        maxLength: 200,
        required: true,
    },
    scientificName: {
        type: String,
        maxLength: 100,
        required: true,
    },
    plantImageUrls: [{
        type: String,
        maxLength: 300,
        required: true,
    }],
    plantInfoUrls: [{
        type: String,
        maxLength: 300,
        required: true,
    }]
});

const PlantInGarden = mongoose.model("PlantInGarden", plantInGardenSchema);

module.exports = PlantInGarden;