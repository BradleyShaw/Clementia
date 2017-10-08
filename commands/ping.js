module.exports = async function(bot, message, args) {
  message.channel.send(`Pong! \`${bot.client.ping.toFixed(2)}ms\``);
}
