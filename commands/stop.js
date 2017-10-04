module.exports = async function (bot, message, args) {
  if (message.author.id !== bot.config.owner) {
    message.reply('You are not authorized to use this command.');
    return;
  }

  if (!message.member.voiceChannel) {
    return;
  }

  if (!message.member.voiceChannel.connection) {
    return;
  }

  message.member.voiceChannel.connection.disconnect();
}