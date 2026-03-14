app.get("/", (req,res)=>{
res.send("SYSTEM IOS SERVER ONLINE");
});
const express = require("express");
const app = express();

app.use(express.json());

/*
KEY STRUCTURE
key: mã key
expire: ngày hết hạn (timestamp)
maxUse: số lượt tối đa
used: số lượt đã dùng
devices: thiết bị đã login
*/

let keys = [
{
key:"VIP2026",
expire: Date.now() + (10*24*60*60*1000), // 7 ngày
maxUse:9999999999,
used:0,
devices:[]
},
{
key:"TEST1",
expire: Date.now() + (10*24*60*60*1000),
maxUse:999999999,
used:0,
devices:[]
}
];


// ================= CHECK KEY =================
app.post("/checkKey",(req,res)=>{

const {key,deviceId}=req.body;

const k = keys.find(x=>x.key===key);

if(!k){
return res.json({success:false,message:"Invalid key"});
}

// kiểm tra hết hạn
if(Date.now() > k.expire){
return res.json({success:false,message:"Key expired"});
}

// kiểm tra device
if(!k.devices.includes(deviceId)){

if(k.used >= k.maxUse){
return res.json({success:false,message:"Key usage limit"});
}

k.devices.push(deviceId);
k.used++;
}

res.json({
success:true,
expire:k.expire,
used:k.used,
maxUse:k.maxUse
});

});


// ================= VIEW KEY (TEST) =================
app.get("/keys",(req,res)=>{
res.json(keys);
});


app.listen(process.env.PORT || 3000,()=>{
console.log("SYSTEM IOS KEY SERVER RUNNING");
});
