const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        maxLength: 100,
        required: true,
    },
    firstName: {
        type: String,
        maxLength: 100,
        required: true,
    },
    lastName: {
        type: String,
        maxLength: 100,
        required: true,
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;