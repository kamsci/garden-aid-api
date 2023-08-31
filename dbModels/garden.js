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
    }
});

const Garden = mongoose.model("Garden", gardenSchema);

module.exports = Garden;