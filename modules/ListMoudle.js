const mongoose = require("mongoose");
const itemSchema  = require("./ItemMoudle").schema;

const listSchema = mongoose.Schema({
    name : String,
    items: [itemSchema]
  });
const List = mongoose.model("List", listSchema);

module.exports = {schema: listSchema, module: List};