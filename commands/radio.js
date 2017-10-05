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

  const stream = station.streams.filter(function(i) {
    return (!i.geo || i.geo.includes(bot.country))
  }).sort(function(a, b) {
    let points = 0;
    
    if (a.bitrate > b.bitrate) {
      points -= 1;
    } else if (b.bitrate > a.bitrate) {
      points += 1;
    }

    if (a.format === 'MP3' && a.bitrate < 128000) {
      points += 1;
    }
    if (b.format === 'MP3' && b.bitrate < 128000) {
      points -= 1;
    }

    return points;
  })[0];

  if (!stream) {
    message.reply(`I was unable to find a usable stream for \`${station.name}\``);
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
  
  message.reply(`Playing \`${station.name} (${stream.format}@${stream.bitrate/1000}k)\``);
  const dispatcher = await voiceChannel.connection.playArbitraryInput(stream.url, {bitrate: 'auto'});
  dispatcher.on('error', e => bot.log.error(e));
}