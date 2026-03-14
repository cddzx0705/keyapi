const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

/* ================= CONFIG ================= */

const ADMIN = {
  username: "admin",
  password: "123456",
  token: "ADMIN_TOKEN_2026"
};

const DB = "./keys.json";

/* ================= LOAD DB ================= */

let keys = [];

if (fs.existsSync(DB)) {
  keys = JSON.parse(fs.readFileSync(DB));
}

/* ================= SAVE DB ================= */

function saveDB() {
  fs.writeFileSync(DB, JSON.stringify(keys, null, 2));
}

/* ================= ADMIN LOGIN ================= */

app.post("/admin/login", (req, res) => {

  const { username, password } = req.body;

  if (
    username === ADMIN.username &&
    password === ADMIN.password
  ) {
    return res.json({
      success: true,
      token: ADMIN.token
    });
  }

  res.json({ success: false, message: "Wrong account" });
});

/* ================= CREATE KEY ================= */

app.post("/admin/createKey", (req, res) => {

  const { token, key, days, maxUse } = req.body;

  if (token !== ADMIN.token) {
    return res.json({ success:false, message:"Unauthorized" });
  }

  if (keys.find(k => k.key === key)) {
    return res.json({ success:false, message:"Key existed" });
  }

  const newKey = {
    key,
    expire: Date.now() + (days * 86400000),
    maxUse,
    used: 0,
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

/* ================= CHECK KEY ================= */

app.post("/checkKey", (req, res) => {

  const { key, deviceId } = req.body;

  const k = keys.find(x => x.key === key);

  if (!k)
    return res.json({ success:false, message:"Invalid key" });

  if (Date.now() > k.expire)
    return res.json({ success:false, message:"Key expired" });

  if (!k.devices.includes(deviceId)) {

    if (k.used >= k.maxUse)
      return res.json({ success:false, message:"Usage limit" });

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

/* ================= VIEW KEYS ================= */

app.post("/admin/keys",(req,res)=>{

  const {token} = req.body;

  if(token !== ADMIN.token)
    return res.json({success:false});

  res.json(keys);
});

/* ================= START ================= */

app.listen(process.env.PORT || 3000, () => {
  console.log("✅ KEY SERVER RUNNING");
});
