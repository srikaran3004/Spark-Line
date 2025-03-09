import {Telegraf} from 'telegraf'


const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async(ctx)=>{
    console.log('ctx',ctx);

    //Store the user information into Database  
    await ctx.reply("Welcome to bot,Its working!");
});

bot.launch();

// Graceful shutdown
process.once('SIGINT',()=>bot.stop('SIGINT'));
process.once('SIGTERM',()=>bot.stop('SIGTERM'));
