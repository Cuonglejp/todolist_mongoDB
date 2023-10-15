//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Get connection string and port
const connectionStr = process.env.MONGO_CONNECTION_STR;
const port = process.env.PORT

//Connect to mongoose database
mongoose.connect(connectionStr);

//Initial schema for 
const itemSchema = mongoose.Schema({
  name: {
    type: String
  }
});
const Item = mongoose.model("Item",itemSchema);

const listSchema = mongoose.Schema({
  name : String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);

//Create initial to do list
async function initialToDoListDB (){
  try{
    await Item.deleteMany();
    console.log("Deleted all data in item collections successfully");
    await Item.insertMany([
      {name: "Do homework"},
      {name: "Clearn house"},
      {name: "Sleep"}
    ]);
    console.log("Inserted three items successfully");
  }catch(err){
    console.log("Error: " + err.message);
  }
}

//Create get all items in to do list
async function getAllItemsInToToDoList(collection){
  try{
    const allItems =  await collection.find({});
    console.log("Get all items successfully");
    return allItems;
  }catch(err){
    console.log("Error: " + err.message);
    return {};
  }  
}

//Create add item to todo list
async function addItemToToDoList(item){
  try{
    await item.save();
    console.log("Inserted item successfully");
  }catch(err){
    console.log("Error: " + err.message);
  }  
}

//Create delete item todolist function
async function deleteItemInToDoList(collection, itemId){
  try{
    const nameOfDeletedItem = (await collection.find({_id : itemId})).map(item => item.name);
    await collection.deleteOne({_id : itemId});
    console.log(`Deleted item '${itemId}-${nameOfDeletedItem}' in Items collections successfully`);
  }catch(err){
    console.log("Error: " + err.message);
  }  
}

//Call initalToDolist
//initialToDoListDB();

//Get all items (name and id)
app.get("/", async function(req, res) {
  const orginalItems  = await(await getAllItemsInToToDoList(Item));
  //const items = (await getAllItemsInToToDoList(Item)).map(item => ({name : item.name, id : item._id}) );
  res.render("list", {listTitle: "Today", newListItems: orginalItems});
});

//Add new item
app.post("/", async function(req, res){
  const item = new Item({
      name: req.body.newItem
  });
  const pathName = req.body.list;
  
  if(pathName === "Today"){
    await addItemToToDoList(item);
    res.redirect("/");
  }else{
    await addNewItemInList(pathName,item);
    res.redirect("/"+pathName);
  }
});

//Delete item
app.post("/delete", async function(req, res){
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    await deleteItemInToDoList(Item, checkedId);
    res.redirect("/");
  }else{
    await deleteItemInList(listName,checkedId);
    res.redirect("/"+listName);    
  }
});

//List items
async function createListItems(nameOfList){  
  const newList = new List(
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

async function searchListItems(nameOfList){
  return( await List.findOne({name: nameOfList}))
}

async function addNewItemInList(nameOfList, item){
  try{
    //Save item
    //await item.save();
    //console.log("Save item successfully");

    //Add item to list
    const list = await searchListItems(nameOfList) ;
    list.items.push(item);
    await list.save();
    console.log("Add item '"+ nameOfList  +"' to list successfully");

  }catch(err){
    console.log("Error: " + err.message);
  }
}

async function deleteItemInList(nameOfList, itemId){
  try{
    //Deleted item
    //await deleteItemInToDoList(Item,itemId);

    //Delete item in list using pull
    await List.findOneAndUpdate({name: nameOfList},{$pull : {items: {_id: itemId}}});
    console.log("Delete item '"+ itemId  +"' in List collection successfully");

  }catch(err){
    console.log("Error: " + err.message);
  }
}

function editPathName(pathName){
  return pathName[0].toUpperCase() + pathName.slice(1,pathName.length).toLowerCase();
}

app.get("/:customListName", async (req,res) =>{
  const customListName = editPathName(req.params.customListName);

  //Error favicon.icon ??
  if(customListName.toLowerCase() === "favicon.ico"){
  }else{
    const listItems = await searchListItems(customListName);
    if(!listItems){
      //Create new list
      await createListItems(customListName);   
      
      //Redirect current page
      res.redirect("/" + customListName);
    }
    else{
      //Show exist list
      const showItems = listItems.items.map(item => ({id : item._id, name: item.name }));
      res.render("list", {listTitle: customListName, newListItems: showItems});
    }
  }
});

// app.post("/:customListName", async (req,res) =>{
//   const customListName = req.params.customListName;
//   const newItem = new Item({name: req.body.newItem});
//   await addNewItemInList(customListName,newItem);

//   res.redirect("/"+customListName);
// });

// app.post("/delete/:customListName", async function(req, res){
//   const customListName = req.params.customListName;
//   const itemId = req.body.checkbox;

//   await deleteItemInList(customListName,itemId);
//   res.redirect("/"+customListName);
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port "+port);
});
