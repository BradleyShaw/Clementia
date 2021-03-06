const YouTube = require('youtube-api');
const ytdl = require('ytdl-core');

function formatSecs(secs) {
  secs = Number(secs);
  
  let length = '';
  let h = Math.floor(secs / 3600);
  let m = Math.floor(secs % 3600 / 60);
  let s = Math.floor(secs % 3600 % 60);

  h > 0 ? (h < 10 ? length += `0${h}:` : length += `${h}:`) : null;
  m < 10 ? length += `0${m}:` : length += `${m}:`;
  s < 10 ? length += `0${s}` : length += s;

  return length;
}

function search(auth, options) {
  YouTube.authenticate(auth);

  return new Promise((resolve, reject) => {
    YouTube.search.list(options, (err, data) => {
      if (err) {
        reject(err);
      } else if (!data.items.length > 0) {
        reject('No results found.');
      } else {
        resolve(`https://www.youtube.com/watch?v=${data.items[0].id.videoId}`);
      }
    })
  });
}

module.exports = async function(bot, message, args) {
  if (message.author.id !== bot.config.owner) {
    message.reply('You are not authorized to use this command. ' +
                  'Please consider using Vexera (https://vexera.io).');
    return;
  }

  var url = args[0];

  if (!url) {
    message.channel.send({embed: {
      author: {
        name: bot.client.user.username,
        icon: bot.client.user.avatarURL
      },
      title: `${bot.config.prefix}play`,
      description: 'Plays audio from any service supported by youtube-dl in the `Music` voice channel (if one exists)',
      fields: [
        {
          name: 'Usage',
          value: `\`${bot.config.prefix}play <url>\``
        }
      ]
    }});
    return;
  } else if (!url.match(/^https?:\/\/\S+$/)) {
    url = await search(bot.config.youtube, {
      part: 'id',
      q: args.join(' '),
      regionCode: bot.country
    });
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

  const stream = ytdl(url, {filter: 'audioonly'});
  const dispatcher = voiceChannel.connection.playStream(stream, {bitrate: 'auto'});

  stream.on('info', (info, format) => {
    message.channel.send({embed: {
      author: {
        name: info.author.name,
        url: info.author.channel_url
      },
      title: info.title,
      url: info.video_url,
      thumbnail: {
        url: info.iurlmaxres
      },
      fields: [
        {
          name: 'Duration',
          value: formatSecs(info.length_seconds)
        }
      ]
    }});
  });

  dispatcher.on('error', e => bot.log.error(e));
  dispatcher.on('end', () => stream.destroy());
}