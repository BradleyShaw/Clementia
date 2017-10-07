module.exports = async function(bot, message, args) {
  if (message.author.id !== bot.config.owner) {
    message.reply('You are not authorized to use this command.');
    return;
  }

  if (args.includes('events') || args[0] === 'all') {
    message.channel.send(':arrows_counterclockwise: Events').then(msg => {
      bot.reloadEvents(err => {
        if (err) {
          msg.edit(':negative_squared_cross_mark: Events')
        } else {
          msg.edit(':white_check_mark: Events');
        }
      });
    });
  }

  if (args.includes('commands') || args[0] === 'all') {
    message.channel.send(':arrows_counterclockwise: Commands').then(msg => {
      bot.reloadCommands(err => {
        if (err) {
          message.edit(':negative_squared_cross_mark: Commands');
        } else {
          msg.edit(':white_check_mark: Commands');
        }
      });
    });
  }

  if (args.includes('config') || args[0] === 'all') {
    message.channel.send(':arrows_counterclockwise: Config').then(msg => {
      bot.reloadConfig(err => {
        if (err) {
          msg.edit(':negative_squared_cross_mark: Config');
        } else {
          msg.edit(':white_check_mark: Config');
        }
      });
    });
  }

  if (args.includes('stations') || args[0] === 'all') {
    message.channel.send(':arrows_counterclockwise: Stations').then(msg => {
      bot.reloadStations(err => {
        if (err) {
          msg.edit(':negative_squared_cross_mark: Stations');
        } else {
          msg.edit(':white_check_mark: Stations');
        }
      });
    });
  }

  if (args.includes('views') || args[0] === 'all') {
    message.channel.send(':arrows_counterclockwise: Views').then(msg => {
      bot.reloadViews(err => {
        if (err) {
          msg.edit(':negative_squared_cross_mark: Views');
        } else {
          msg.edit(':white_check_mark: Views');
        }
      });
    });
  }
}
