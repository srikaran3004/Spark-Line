import mongoose from 'mongoose'

/**
 * Database connection configuration
 * Establishes connection to MongoDB using mongoose
 * @returns {Promise} Mongoose connection promise
 */
export default () => {
    // Connect to MongoDB using the connection string from environment variables
    return mongoose.connect(process.env.MONGO_CONNECT_STRING);
}