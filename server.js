import 'dotenv/config';
import { Telegraf } from 'telegraf';
import userModel from './src/models/User.js';
import eventModel from './src/models/Event.js';
import connectDB from './src/config/db.js';
import { message } from 'telegraf/filters';
import { GoogleGenerativeAI } from "@google/generative-ai";

const bot = new Telegraf(process.env.BOT_TOKEN);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Connect to Database
try {
    await connectDB();
    console.log("✅ Database Connected Successfully");
} catch (err) {
    console.error("❌ Database Connection Failed:", err);
    process.exit(1);
}

/**
 * Handle /start command
 * Creates or updates user information in the database
 * Sends a welcome message to the user
 */
bot.start(async (ctx) => {
    console.log('User Connected:', ctx.update.message.from);
    
    const from = ctx.update.message.from;
    try {
        const userUpdate = {
            tgId: from.id,
            firstName: from.first_name || "Unknown",
            isBot: from.is_bot,
            languageCode: from.language_code,
        };
        
        // Only set these fields if they exist
        if (from.last_name) {
            userUpdate.lastName = from.last_name;
        }
        
        if (from.username) {
            userUpdate.userName = from.username;
        }
        
        await userModel.findOneAndUpdate(
            { tgId: from.id },
            { $set: userUpdate },
            { upsert: true, new: true }
        );
        
        await ctx.reply(`Hey ${from.first_name}! 🌟 Welcome! I'm here to help you craft engaging social media posts 🚀. Just log your daily events, and I'll do the rest! ✨`);
    } catch (error) {
        console.error("❌ Error in /start:", error);
        await ctx.reply('⚠️ Something went wrong, please try again later!');
    }
});

/**
 * Handle /generate command
 * Fetches today's events and generates social media posts using Gemini AI
 * Supports LinkedIn, Facebook, and Twitter post formats
 */
bot.command('generate', async (ctx) => {
    const userId = ctx.update.message.from.id;
    const firstName = ctx.update.message.from.first_name;
    
    // Send waiting message and get its ID
    const waitingMessage = await ctx.reply(`⏳ Working on your social media posts, ${firstName}... Please wait a moment.`);
    const waitingMessageId = waitingMessage.message_id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
        const events = await eventModel.find({
            tgId: userId,
            createdAt: { $gte: today }
        });
        
        if (events.length === 0) {
            await ctx.deleteMessage(waitingMessageId);
            return await ctx.reply("📌 No events logged for today. Start adding your events first!");
        }
        
        console.log('📝 Events:', events);
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Act as a senior copywriter. Craft three engaging social media posts for LinkedIn, Facebook, and Twitter based on these events: ${events.map(e => e.text).join(', ')}. Keep the tone engaging and conversational.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        
        // Delete waiting message and send response
        await ctx.deleteMessage(waitingMessageId);
        await ctx.reply(response);
    } catch (err) {
        console.error("❌ Error in /generate:", err);
        // Try to delete waiting message in case of error
        try {
            await ctx.deleteMessage(waitingMessageId);
        } catch (deleteErr) {
            console.error("Could not delete waiting message:", deleteErr);
        }
        await ctx.reply('⚠️ Error generating posts. Please try again later.');
    }
});

/**
 * Handle incoming text messages
 * Logs user events to the database
 * Ignores messages that start with '/' (commands)
 */
bot.on(message('text'), async (ctx) => {
    // Skip processing commands
    if (ctx.update.message.text.startsWith('/')) {
        return;
    }
    
    const from = ctx.update.message.from;
    const text = ctx.update.message.text;
    
    try {
        await eventModel.create({ text, tgId: from.id });
        await ctx.reply("✅ Event logged! To generate posts, type: /generate");
    } catch (err) {
        console.error("❌ Error logging event:", err);
        await ctx.reply("⚠️ Couldn't save event. Please try again.");
    }
});

/**
 * Handle /help command
 * Displays available commands and usage instructions
 */
bot.command('help', async (ctx) => {
    await ctx.reply(
        "🌟 *SparkLine Bot Help* 🌟\n\n" +
        "Here's how to use me:\n\n" +
        "1️⃣ Simply type your daily events as messages\n" +
        "2️⃣ Use /generate to create social media posts based on your events\n" +
        "3️⃣ Events are reset daily, so keep logging!\n\n" +
        "Other commands:\n" +
        "/start - Start the bot\n" +
        "/help - Show this help message",
        { parse_mode: 'Markdown' }
    );
});

// Launch the bot
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
//To run use npm run dev