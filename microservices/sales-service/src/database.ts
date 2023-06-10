import mongoose from 'mongoose';

const connectionString = 'mongodb+srv://gioghisellini:2CNkcu0T42STdfyi@electro-inventory.jdogjkw.mongodb.net/test';
//we should have different databases for each microservice (I know we discussed we may not do this but I believe it's the best)
// const connectionString = 'mongodb://localhost:27017/mongodb2';
export const connectDB = async () => {
    try {
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as mongoose.ConnectOptions);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
};

export const disconnectDB = async () => {
    await mongoose.disconnect();
};
