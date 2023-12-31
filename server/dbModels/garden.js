const mongoose = require("mongoose");

const gardenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        maxLength: 100,
        required: true,
    },
    description: {
        type: String,
        maxLength: 2000,
    },
    plants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plant",
        unique: true,
    }],
}, { strict: true });

const Garden = mongoose.model("Garden", gardenSchema);

module.exports = Garden;