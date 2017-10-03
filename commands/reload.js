module.exports = async function(bot, message, args) {
  if (message.author.id !== bot.config.owner) {
    message.reply('You are not authorized to use this command.');
    return;
  }

  message.channel.send(':arrows_counterclockwise: Events').then(msg => {
    bot.reloadEvents(() => {
      msg.edit(':white_check_mark: Events');
    });
  });

  message.channel.send(':arrows_counterclockwise: Commands').then(msg => {
    bot.reloadCommands(() => {
      msg.edit(':white_check_mark: Commands');
    });
  });
}
