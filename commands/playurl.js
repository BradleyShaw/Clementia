module.exports = async function(bot, message, args) {
  if (message.author.id !== bot.config.owner) {
    message.reply('You are not authorized to use this command.');
    return;
  }

  if (!args[0]) {
    message.reply('Usage: playurl <url>');
    return;
  }

  const voiceChannel = message.guild.channels.find(val => val.name === 'Music');
  
  if (!voiceChannel) {
    message.reply('This Guild has no Music channel');
    return;
  }

  const connection = (voiceChannel.members.has(bot.client.user.id)
                      ? voiceChannel.connection
                      : await voiceChannel.join());
  
  const dispatcher = await connection.playArbitraryInput(args[0], {bitrate: 'auto'});
  dispatcher.on('error', e => bot.log.error(e));
  dispatcher.on('end', reason => {
    bot.log.debug(reason);
    voiceChannel.leave();
  });
}