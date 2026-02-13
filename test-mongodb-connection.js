const mongoose = require('mongoose');
const dns = require('dns');

// Force IPv4
dns.setDefaultResultOrder('ipv4first');

const MONGODB_URI = 'mongodb+srv://shr:shr@pocketlogcluster.gzppcuj.mongodb.net/pocketlog?retryWrites=true&w=majority&appName=PocketLogCluster';

console.log('🔍 Testing MongoDB connection...\n');

// Test 1: DNS Resolution
console.log('Test 1: Checking DNS resolution for MongoDB cluster...');
dns.resolveSrv('_mongodb._tcp.pocketlogcluster.gzppcuj.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('❌ DNS Resolution Failed:', err.message);
        console.log('\n💡 Possible causes:');
        console.log('   - Network/Firewall blocking DNS queries');
        console.log('   - VPN or proxy interference');
        console.log('   - DNS server issues\n');
    } else {
        console.log('✅ DNS Resolution Successful');
        console.log('   Found servers:', addresses);
    }
});

// Test 2: MongoDB Connection
console.log('\nTest 2: Attempting MongoDB connection...');

const opts = {
    serverSelectionTimeoutMS: 10000,
    family: 4,
};

mongoose.connect(MONGODB_URI, opts)
    .then(() => {
        console.log('✅ MongoDB Connection Successful!');
        console.log('   Database:', mongoose.connection.db.databaseName);
        mongoose.connection.close();
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ MongoDB Connection Failed:', error.message);
        console.log('\n💡 Troubleshooting steps:');
        console.log('   1. Check if your IP is whitelisted in MongoDB Atlas');
        console.log('      → Go to Network Access in MongoDB Atlas');
        console.log('      → Add your current IP or use 0.0.0.0/0 for testing');
        console.log('   2. Verify your MongoDB credentials are correct');
        console.log('   3. Check if you\'re behind a firewall/VPN');
        console.log('   4. Try using a standard connection string instead of SRV\n');
        process.exit(1);
    });
