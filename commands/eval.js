module.exports = function(bot, message, args) {
  if (message.author.id !== bot.config.owner) {
    message.reply('You are not authorized to use this command.');
    return;
  }

  let msg = ['```'];
  try {
    msg.push(eval(args.join(' ')));
  } catch (err) {
    msg.push(err.toString());
  }
  msg.push('```');

  message.channel.send(msg.join('\n'));
}
