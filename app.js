//Import 
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const ConnectingDBClass = require("./databaseConnectClass");
const connectingDB = new ConnectingDBClass();
require('dotenv').config();

//Setting for app
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Get running port
const port = process.env.PORT

//Get all items (name and id)
app.get("/", async function(req, res) {
  const orginalItems  = await(await connectingDB.getAllItemsInToToDoList());
  res.render("list", {listTitle: "Today", newListItems: orginalItems});
});

//Add new item
app.post("/", async function(req, res){
  const pathName = req.body.list;
  const itemName = req.body.newItem;
  if(pathName === "Today"){
    await connectingDB.addItemToToDoList(itemName);
    res.redirect("/");
  }else{
    await connectingDB.addNewItemInList(pathName,itemName);
    res.redirect("/"+pathName);
  }
});

//Delete item
app.post("/delete", async function(req, res){
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    await connectingDB.deleteItemInToDoList(checkedId);
    res.redirect("/");
  }else{
    await connectingDB.deleteItemInList(listName,checkedId);
    res.redirect("/"+listName);    
  }
});

app.get("/:customListName", async (req,res) =>{
  const customListName = connectingDB.editPathName(req.params.customListName);

  //Error favicon.icon ??
  if(customListName.toLowerCase() === "favicon.ico"){
  }else{
    const listItems = await connectingDB.searchListItems(customListName);
    if(!listItems){
      //Create new list
      await connectingDB.createListItems(customListName);   
      
      //Redirect current page
      res.redirect("/" + customListName);
    }
    else{
      //Show exist list
      res.render("list", {listTitle: customListName, newListItems: listItems.items});
    }
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, function() {
  console.log("Server started on port "+port);
});
