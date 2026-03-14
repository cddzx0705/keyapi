const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/*
=============================
CONFIG ADMIN
=============================
*/

const ADMIN_USER = "admin";
const ADMIN_PASS = "123456";

/*
=============================
LOAD DATABASE
=============================
*/

const DB = "./keys.json";

let keys = [];

if (fs.existsSync(DB)) {
  keys = JSON.parse(fs.readFileSync(DB));
}

/*
=============================
SAVE DATABASE
=============================
*/

function saveDB(){
  fs.writeFileSync(DB, JSON.stringify(keys,null,2));
}

/*
=============================
TEST SERVER
=============================
*/

app.get("/",(req,res)=>{
  res.send("KEY SERVER RUNNING");
});

/*
=============================
ADMIN LOGIN
=============================
*/

app.post("/admin/login",(req,res)=>{

const {username,password} = req.body;

if(username === ADMIN_USER && password === ADMIN_PASS){

return res.json({
success:true,
message:"Login success"
});

}

res.json({
success:false,
message:"Wrong admin account"
});

});

/*
=============================
CREATE KEY
=============================
*/

app.post("/admin/createKey",(req,res)=>{

const {key,days,maxUse} = req.body;

if(!key){
return res.json({success:false,message:"Key required"});
}

if(keys.find(k=>k.key===key)){
return res.json({success:false,message:"Key existed"});
}

const newKey = {

key:key,

expire: Date.now() + (days*86400000),

maxUse:maxUse,

used:0,

devices:[]

};

keys.push(newKey);

saveDB();

res.json({
success:true,
message:"Key created",
data:newKey
});

});

/*
=============================
CHECK KEY
=============================
*/

app.post("/checkKey",(req,res)=>{

const {key,deviceId} = req.body;

const k = keys.find(x=>x.key===key);

if(!k){
return res.json({success:false,message:"Invalid key"});
}

if(Date.now() > k.expire){
return res.json({success:false,message:"Key expired"});
}

if(!k.devices.includes(deviceId)){

if(k.used >= k.maxUse){
return res.json({success:false,message:"Usage limit"});
}

k.devices.push(deviceId);
k.used++;

saveDB();

}

res.json({
success:true,
expire:k.expire,
used:k.used,
maxUse:k.maxUse
});

});

/*
=============================
VIEW KEYS
=============================
*/

app.get("/admin/keys",(req,res)=>{
res.json(keys);
});

/*
=============================
START SERVER
=============================
*/

app.listen(process.env.PORT || 3000,()=>{

console.log("KEY SERVER RUNNING");

});
