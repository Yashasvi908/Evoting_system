const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://yashasvi:verma123@cluster0.y3qwuv5.mongodb.net/evoting?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error', err);
    process.exit(1);
  });
