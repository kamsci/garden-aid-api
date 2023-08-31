const mongoose = require("mongoose");

const taskByPlantSchema = new mongoose.Schema({
    plant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plant",
        required: true,
    },
    type: {
        type: String,
        maxLength: 100,
        required: true,
    },
    description: {
        type: String,
        maxLength: 2000,
        required: true,
    },
});

const TaskByPlant = mongoose.model("TaskByPlant", taskByPlantSchema);

module.exports = TaskByPlant;