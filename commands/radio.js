const Discord = require('discord.js');
const icy = require('icy');

module.exports = async function(bot, message, args) {
  if (!args[0]) {
    let codes = [];
    let stations = [];
    Object.keys(bot.stations).forEach(k => {
      codes.push(k);
      stations.push(`[${bot.stations[k].name}](${bot.stations[k].url})`);
    });
    message.channel.send({embed: {
      author: {
        name: bot.client.user.username,
        icon: bot.client.user.avatarURL
      },
      title: `${bot.config.prefix}radio`,
      description: 'Plays a radio station in the `Music` voice channel (if one exists).',
      fields: [
        {
          name: 'Usage',
          value: `\`${bot.config.prefix}radio <code>\``
        },
        {
          name: 'Stations',
          value: `${bot.config.url}/stations`
        }
      ]
    }});
    return;
  }

  const station = bot.stations[args[0]];

  if (!station) {
    message.reply(`\`${args[0]}\` is not a valid station ID. ` +
                  `Use \`${bot.config.prefix}radio\` to get a list of stations.`);
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
  } else if (voiceChannel.connection.dispatcher) {
    voiceChannel.connection.dispatcher.end();
  }

  message.channel.send({embed: {
    author: {
      name: station.name,
      url: station.url
    },
    fields: [
      {
        name: 'Format',
        value: `\`${stream.format}\``,
        inline: true
      },
      {
        name: 'Bitrate',
        value: `\`${stream.bitrate/1000}kbps\``,
        inline: true
      }
    ]
  }});

  if (stream.type === 'ICY') {
    var title = '';
    icy.get(stream.url, res => {
      const dispatcher = voiceChannel.connection.playStream(res, {bitrate: 'auto'});

      res.on('metadata', metadata => {
        let meta = icy.parse(metadata);
        if (!meta.StreamTitle || meta.StreamTitle === title) return;
        title = meta.StreamTitle;
        message.channel.send({embed: {
          author: {
            name: station.name,
            url: station.url
          },
          title: 'Now Playing',
          description: meta.StreamTitle
        }});
      });

      dispatcher.on('end', () => res.destroy());
    });
  } else {
    const dispatcher = voiceChannel.connection.playArbitraryInput(stream.url, {bitrate: 'auto'});
  }

  dispatcher.on('start', () => {
    bot.log.debug('Started streaming (guild: %s, station: %s)', message.guild.id, station.name);
  });

  dispatcher.on('error', e => {
    bot.log.error('Error (guild: %s, station: %s):', message.guild.id, station.name, e);
  });

  dispatcher.on('end', reason => {
    bot.log.debug('Stream ended (guild: %s, station: %s): %s', message.guild.id, station.name, reason);
    if (reason !== 'user') voiceChannel.leave();
  });
}