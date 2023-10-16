const mongoose = require("mongoose");

//Initial schema for 
const itemSchema = mongoose.Schema({
    name: {
    type: String
    }
});
const Item = mongoose.model("Item",itemSchema);

module.exports = {schema: itemSchema, module: Item};