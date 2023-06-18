const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express();
var _ = require('lodash');
const mongoose = require("mongoose");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs"); //tell express to use ejs

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb+srv://someshnaruka:sNaruka@cluster0.2alfje0.mongodb.net/tododb", {
    useNewUrlParser: true,
  });

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const itemsSchema = new mongoose.Schema({
  name: String,
});


const Item = mongoose.model("Item", itemsSchema);

const getMilk = new Item({ name: "GetMilk" });
const running = new Item({ name: "Running" });
const football = new Item({ name: "Football" });
const Gardening = new Item({ name: "trim plants" });

const itemArr = [getMilk, running, football,Gardening];

const customSchema= new mongoose.Schema({
  name:String,
  customArr:[itemsSchema]
});
const Custom=mongoose.model("Custom",customSchema);



function dataInsert() {
// insert no longer excepts call back hence then catch is used
  Item.insertMany(itemArr)
    .then(function () {
      console.log("Successfully saved defult items to DB");
    })
    .catch(function (err) {
      console.log(err);
    });
}
// dataInsert(); // to insert data inside collection
// Item.deleteMany({ name: {$in:["Running","Football","GetMilk"]}})
const day = date();

app.get("/", (req, res) => {
  // find no longer excepts call back hence then catch is used
  Item.find({})
    .then(function (data)
     {
      if(data.length==0)
      {
        dataInsert();
        res.redirect("/");
      }
      else
      {
        res.render("list", { listTitle: "Today", listItems: data });
      }
     
    })
    .catch(function (err) {
      console.log(err);
    });
});

// app.get("/work", (req, res) => {
//   res.render("list", { listTitle: "Work List", listItems: workList });
// });
app.get("/About", (req, res) => {
  res.render("About");
});

app.post("/", (req, res) => {
  const itemName = req.body.input;
  const listName=req.body.list;

  const item = new Item({ name: itemName });
  if(listName=="Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    Custom.findOne({name:listName}).then((foundData)=>{
      foundData.customArr.push(item);
      foundData.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",(req,res)=>{
  const checkedItem=req.body.deleteItem;
  const routeName=req.body.listName;

if(routeName=="Today")
{
  Item.deleteOne({ _id: checkedItem }).then(()=>{
    console.log("record deleted successfully");
  }).catch((err)=>{
    console.log(err);
  });
  res.redirect("/");
}
else
{
  Custom.updateOne({ name:routeName},{$pull:{customArr:{_id:checkedItem}}}).then(()=>{
    console.log("record deleted successfully");
  }).catch((err)=>{
    console.log(err);
  });
  res.redirect("/"+ routeName);
}
 
});

app.get("/:listType",(req,res)=>{
  const customListName=_.capitalize(req.params.listType);
  
  Custom.findOne({name:customListName}).then((data)=>{
    if(data==null)
    {
      const list = new Custom({ 
        name: customListName,
        customArr:itemArr
       });
    
       list.save();
       res.redirect("/"+ customListName);
    }
    else{
      res.render("list",{ listTitle: data.name, listItems: data.customArr })
    }
 
  }).catch((err)=>{
    console.log(err);
  })
  
})

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
