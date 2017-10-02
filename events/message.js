module.exports = function(bot, message) {
  if (message.author.bot) return;

  if (message.content.indexOf(bot.config.prefix) !== 0) return;

  const args = message.content.slice(bot.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  bot.commands.emit(command, message, args);
}