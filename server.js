import {Telegraf} from 'telegraf'
import userModel from './src/models/User.js';
import eventModel from './src/models/Event.js';
import connectDB from './src/config/db.js';
import {message} from 'telegraf/filters';


const bot = new Telegraf(process.env.BOT_TOKEN);


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
