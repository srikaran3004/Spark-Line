import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    tgId: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: false, // Make lastName optional as not all users have it
    },
    isBot: {
        type: Boolean,
        required: true,
    },
    userName: {
        type: String,
        required: false, // Make userName optional
        unique: true,
        sparse: true, // Only enforce uniqueness on documents where userName exists
    },
    languageCode: {
        type: String,
        required: false,
    },
    promptTokens: {
        type: Number,
        required: false,
        default: 0,
    },
    completionTokens: {
        type: Number,
        required: false,
        default: 0,
    },
}, 
    { timestamps: true}
);

export default mongoose.model('User', userSchema);