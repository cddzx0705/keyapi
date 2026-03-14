const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const APP_TOKEN = "APP_IF5EJ3IKKVA1JY5AKURW1FTVDX6XIFLT";

function loadKeys(){
return JSON.parse(fs.readFileSync("keys.json"));
}

function saveKeys(data){
fs.writeFileSync("keys.json",JSON.stringify(data,null,2));
}

app.post("/checkKey",(req,res)=>{

const {key,token,deviceId}=req.body;

if(token!==APP_TOKEN){
return res.json({status:false,message:"Token sai"});
}

let keys=loadKeys();

let k=keys[key];

if(!k){
return res.json({status:false,message:"Key không tồn tại"});
}

let now=new Date();
let expire=new Date(k.expire);

if(now>expire){
return res.json({status:false,message:"Key đã hết hạn"});
}

if(k.devices.length>=k.maxDevices && !k.devices.includes(deviceId)){
return res.json({status:false,message:"Key đã hết lượt sử dụng"});
}

if(!k.devices.includes(deviceId)){
k.devices.push(deviceId);
}

saveKeys(keys);

res.json({
status:true,
message:"Key hợp lệ",
expire:k.expire,
devices:k.devices.length,
maxDevices:k.maxDevices
});

});

app.get("/",(req,res)=>{
res.send("KEY SERVER ONLINE");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
console.log("Server chạy "+PORT);
});