import {Telegraf} from 'telegraf'
import userModel from './src/models/User.js';
import eventModel from './src/models/Event.js';
import connectDB from './src/config/db.js';
import {message} from 'telegraf/filters';
import OpenAI from 'openai';
import { captureRejectionSymbol } from 'events';


const bot = new Telegraf(process.env.BOT_TOKEN);

const client = new OpenAI({
    apiKey: process.env['OPENAI_KEY'], // This is the default and can be omitted
  });


try{
    connectDB();
    console.log("Database Connected Sucessfully");
}catch(err){
    console.log(err);
    process.kill(process.pid,'SIGTERM');
}



bot.start(async(ctx)=>{
    console.log('ctx',ctx);

    //Creating a new user, if exists then update the user
    const from=ctx.update.message.from;
    try{
        await userModel.findOneAndUpdate({
            tgId:from.id,
        },
        {
            $setOnInsert:{
                firstName:from.first_name,
                lastName:from.last_name,
                username:from.username,
                isBot:from.is_bot,
                languageCode:from.language_code,
            },
        },{upsert:true,new:true});

        //Store the user information into Database  
        await ctx.reply(`Hey! ${from.first_name}, Welcome,🌟 I'm crafting captivating social media posts for you 🚀. Keep me in the loop with the latest events 😎. Let's elevate our social media game together! ✨ `);
    }
    catch(error){
        console.log('error',error);
        await ctx.reply('Experiencing Challenges!');
    }

});

bot.command('generate',async(ctx)=>{
    //get events for the user

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const endOfTheDay = new Date();
    endOfTheDay.setHours(23,59,59,999);

    const events = await eventModel.find({tgId:ctx.update.message.from.id,
        createdAt:{
            $gte:startOfDay,
            $lte:endOfTheDay,
        },
    });
    if(events.length===0){
        await ctx.reply("No events for the day.");
        return ;
    }
    console.log('events',events);

    //make openai api call 
     try{
        const chatCompletion = await client.chat.completions.create({
            messages: [
                {role: "system", content: `Act as a senior copywriter, you write highly engaging posts for Linkedin, facbook and twitter using provided thoughts/events through out the day.`},
                {role: "user", content: `Write like a human, for humans. Craft three engaging social media posts tailored for Linkedin, Facebook and Twitter Audiences.Use simple language. Use given time labels just to understand the order of the events, don't mention the time in the posts. Each post should creatively highlight the following events. Ensure the tone is conversational and impactful. Focus on engaging the respective platforms audience,encouraging Interaction and driving interest in the events: ${events.map((event) => event.text).join(', ')}`}
            ],
            model:process.env.OPENAI_MODEL,
        });
     }catch(err){

     }
    
    //store token count
    //send response to the user
    await ctx.reply('Generating posts...');

});

bot.on(message('text'),async(ctx)=>{
    const from = ctx.update.message.from;
    const message = ctx.update.message.text;

    try{
        await eventModel.create({
            text: message,
            tgId: from.id,
        });
        await ctx.reply('Logged info👍,Keep me posted on your thought process 🤖. To generate the posts, Please enter command: /generate');
    }catch(err){
        console.log(err);
        await ctx.reply('Facing Challenges, Please try again later.');
    }

});



bot.launch();

// Graceful shutdown
process.once('SIGINT',()=>bot.stop('SIGINT'));
process.once('SIGTERM',()=>bot.stop('SIGTERM'));
