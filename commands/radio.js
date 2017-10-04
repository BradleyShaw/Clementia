module.exports = async function(bot, message, args) {
  if (message.author.id !== bot.config.owner) {
    message.reply('You are not authorized to use this command.');
    return;
  }

  const station = bot.stations[args[0]];

  if (!station) {
    message.reply('Usage: radio [<code>]');
    return;
  }

  const voiceChannel = message.guild.channels.find(val => val.name === 'Music');
  
  if (!voiceChannel) {
    message.reply('This Guild has no Music channel');
    return;
  }

  if (!voiceChannel.members.has(bot.client.user.id)) {
    await voiceChannel.join();
  }
  
  message.reply(`Playing \`${station.name} (${station.stream.format}@${station.stream.bitrate/1000}k)\``);
  const dispatcher = await voiceChannel.connection.playArbitraryInput(station.stream.url, {bitrate: 'auto'});
  dispatcher.on('error', e => bot.log.error(e));
}