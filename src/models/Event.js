// Import mongoose ODM library for MongoDB
import mongoose from 'mongoose'

// Define the Event schema structure
const eventSchema = mongoose.Schema({
    // Text field to store event content/description
    text: {
        type: String,
        required: true, // Field must be provided when creating a new event
    },
    // Telegram message ID field
    tgId: {
        type: String,
        required: true, // Field must be provided when creating a new event
    },
},
    // Schema options - enables automatic timestamps (createdAt, updatedAt)
    { timestamps: true}
);

// Create and export the Event model using the schema
export default mongoose.model('Event',eventSchema);