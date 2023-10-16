const mongoose = require("mongoose");
const itemModule  = require("./modules/ItemMoudle").module;
const listModule  = require("./modules/ListMoudle").module;
require('dotenv').config();

class ConnectingDB{
 
  constructor(){
    //Get connection string and port
    this.connectionStr = process.env.MONGO_CONNECTION_STR;
    
    //Connect to mongoose database
    mongoose.connect(this.connectionStr);

    console.log("Connected to DB successfully");
  }

  //Create get all items in to do list
  async getAllItemsInToToDoList(){
    try{
      const allItems =  await itemModule.find({});
      console.log("Get all items successfully");
      return allItems;
    }catch(err){
      console.log("Error: " + err.message);
      return {};
    }  
  }

  //Create add item to todo list
  async addItemToToDoList(itemName){
    try{
      const item = new itemModule({
          name: itemName
      });
      await item.save();
      console.log("Inserted item successfully");
    }catch(err){
      console.log("Error: " + err.message);
    }  
  }

  //Create delete item todolist function
  async deleteItemInToDoList(itemId){
    try{
      const nameOfDeletedItem = (await itemModule.find({_id : itemId})).map(item => item.name);
      await itemModule.deleteOne({_id : itemId});
      console.log(`Deleted item '${itemId}-${nameOfDeletedItem}' in Items collections successfully`);
    }catch(err){
      console.log("Error: " + err.message);
    }  
  }

  //List items
  async createListItems(nameOfList){  
    const newList = new listModule(
        {
          name: nameOfList,
          items: [
            {name: "Do homework"},
            {name: "Clearn house"},
            {name: "Sleep"}
          ]
        });
    await newList.save();
    console.log("Created collection '" + nameOfList + "' successfully");
  }

  async searchListItems(nameOfList){
    return( await listModule.findOne({name: nameOfList}))
  }

  async addNewItemInList(nameOfList, itemName){
    try{
      //Create new item
      const item = new itemModule({
        name: itemName
      });
      
      //Search list
      const list = await this.searchListItems(nameOfList) ;

      //Push item to list
      list.items.push(item);

      //Save list
      await list.save();

      console.log("Add item '"+ nameOfList  +"' to list successfully");
    }catch(err){
      console.log("Error: " + err.message);
    }
  }

  async deleteItemInList(nameOfList, itemId){
    try{
      console.log(itemId);

      //Delete item in list using pull
      await listModule.findOneAndUpdate({name: nameOfList},{$pull : {items: {_id: itemId}}});
      console.log("Delete item '"+ itemId  +"' in List collection successfully");

    }catch(err){
      console.log("Error: " + err.message);
    }
  }

  editPathName(pathName){
    return pathName[0].toUpperCase() + pathName.slice(1,pathName.length).toLowerCase();
  }
}

module.exports = ConnectingDB;