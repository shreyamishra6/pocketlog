const mongoose = require('mongoose');
const dns = require('node:dns');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

dns.setDefaultResultOrder('ipv4first');

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("MONGODB_URI not found in .env.local");
    process.exit(1);
}

console.log("Connecting to:", uri.replace(/:([^@]+)@/, ":****@"));

mongoose.connect(uri)
    .then(() => {
        console.log("Successfully connected to MongoDB!");
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection failed:", err);
        process.exit(1);
    });
