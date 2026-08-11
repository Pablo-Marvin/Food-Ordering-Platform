const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/crispiest-chicken').then(async () => {
  await mongoose.connection.collection('orders').updateMany({}, { $set: { 'customer.email': 'admin@gmail.com' } });
  console.log('Updated orders');
  process.exit(0);
});
