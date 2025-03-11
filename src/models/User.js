// Import mongoose for MongoDB object modeling
import mongoose from 'mongoose'

// Define the user schema for Telegram bot users
const userSchema = mongoose.Schema({
    // Unique Telegram user ID
    tgId: {
        type: String,
        required: true,
        unique: true,
    },
    // User's first name from Telegram
    firstName: {
        type: String,
        required: true,
    },
    // User's last name from Telegram (optional)
    lastName: {
        type: String,
        required: false,
    },
    // Flag to identify if the user is a bot
    isBot: {
        type: Boolean,
        required: true,
    },
    // Telegram username (optional)
    // Must be unique if provided
    userName: {
        type: String,
        required: false,
        unique: true,
        sparse: true, // Ensures uniqueness only when userName is present
    },
    // User's preferred language code
    languageCode: {
        type: String,
        required: false,
    },
    // Count of tokens used in prompts
    promptTokens: {
        type: Number,
        required: false,
        default: 0,
    },
    // Count of tokens used in completions
    completionTokens: {
        type: Number,
        required: false,
        default: 0,
    },
}, 
// Enable automatic timestamps (createdAt, updatedAt)
{ timestamps: true }
);

// Export the User model
export default mongoose.model('User', userSchema);