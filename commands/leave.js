module.exports = async function (bot, message, args) {
  if (!message.member.voiceChannel || !message.member.voiceChannel.connection) {
    message.reply('You must be in the same voice channel as me to use this command.');
    return;
  }

  message.member.voiceChannel.leave();
}