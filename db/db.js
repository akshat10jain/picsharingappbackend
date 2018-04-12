const mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect(process.env.MONGODB, { useMongoClient: true });
mongoose.connection.on('error', () => {
    console.log("MongoDB connection error. Please make sure that MongoDB is running.");
    process.exit(1);
});
