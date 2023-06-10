import mongoose from 'mongoose';

export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        await mongoose.connection.db.command({ ping: 1 });
        return true;
    } catch (error) {
        return false;
    }
}
