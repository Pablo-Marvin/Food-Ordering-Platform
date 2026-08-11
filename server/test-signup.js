const axios = require('axios');
const mongoose = require('mongoose');

async function testSignupAndDB() {
  const testUser = {
    name: "Agent Test User",
    email: `agent_test_${Date.now()}@example.com`,
    password: "securepassword123",
    phone: "1234567890"
  };

  try {
    console.log("1. Sending Signup Request to API...");
    const res = await axios.post('http://localhost:5000/api/auth/register', testUser);
    console.log("✅ API Response:", res.data);

    console.log("\n2. Connecting directly to MongoDB to verify...");
    await mongoose.connect('mongodb://localhost:27017/crispiest-chicken');
    
    // Check the 'users' collection directly
    const userInDb = await mongoose.connection.db.collection('users').findOne({ email: testUser.email });
    
    if (userInDb) {
      console.log("✅ SUCCESS! Found the user in the database:");
      console.log(`   ID: ${userInDb._id}`);
      console.log(`   Name: ${userInDb.name}`);
      console.log(`   Email: ${userInDb.email}`);
      console.log(`   Password: ${userInDb.password} (Notice it is HASHED for security!)`);
    } else {
      console.log("❌ FAILED! Could not find the user in the database.");
    }
  } catch (error) {
    console.error("Error during test:", error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testSignupAndDB();
