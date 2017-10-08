const util = require('util');

module.exports = function(bot, message, args) {
  if (message.author.id !== bot.config.owner) {
    message.reply('You are not authorized to use this command.');
    return;
  }

  try {
    let output = util.inspect(eval(args.join(' ')));
    message.channel.send({embed: {
      color: 0x00FF00,
      title: 'Output',
      description: '```\n' + output + '\n```'
    }});
  } catch (err) {
    message.channel.send({embed: {
      color: 0xFF0000,
      title: 'Error',
      description: '```\n' + err.stack + '\n```'
    }});
  }
}
