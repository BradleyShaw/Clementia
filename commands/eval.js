const Discord = require('discord.js');
const paste = require('../utils/paste');
const util = require('util');

module.exports = function(bot, message, args) {
  if (message.author.id !== bot.config.owner) {
    message.reply('You are not authorized to use this command.');
    return;
  }

  this.embed = new Discord.RichEmbed();
  this.output = '';

  try {
    this.output = eval(args.join(' '));
    if (typeof(this.output) !== 'string') {
      this.output = util.inspect(this.output);
    }
    this.embed.setColor(0x00FF00);
    this.embed.setTitle('Output');
  } catch (err) {
    this.output = err.stack;
    this.embed.setColor(0xFF0000);
    this.embed.setTitle('Error');
  }

  let length = this.output.length + 8;
  if (length > 2048) {
    paste(this.output).then(url => {
      this.embed.setDescription(url);
      message.channel.send({embed: this.embed});
    });
  } else {
    this.embed.setDescription('```\n' + this.output + '\n```');
    message.channel.send({embed: this.embed});
  }
}
