const cprocess = require('child_process');

module.exports = async function(bot, message, args) {
  if (message.author.id !== bot.config.owner) {
    bot.reply('You are not authorized to use this command.');
    return;
  }

  this.outpart = '';
  this.msg = '';

  this.update = function(data) {
    if (!data.endsWith('\n')) {
      this.outpart += data;
    } else {
      data = this.outpart += data;
      this.outpart = '';
      return data;
    }
  }

  this.codeMsg = function() {
    return '```\n' + this.msg.trim() + '\n```';
  }

  message.channel.send('```\n```').then(msg => {
    const proc = cprocess.exec(args.join(' '), {shell: '/bin/bash'});

    proc.stdout.on('data', out => {
      data = this.update(out);
      if (data) {
        this.msg += data;
        msg.edit(this.codeMsg());
      }
    });

    proc.stderr.on('data', out => {
      data = this.update(out);
      if (data) {
        this.msg += data;
        msg.edit(this.codeMsg());
      }
    });

    proc.on('exit', (code, signal) => {
      if (this.outpart !== '') {
        this.msg += this.outpart;
        msg.edit(this.codeMsg);
      }
      if (code === 0) {
        msg.react('\u2705'); // :white_check_mark:
      } else {
        msg.react('\u274E'); // :negative_squared_cross_mark:
      }
    });

    proc.on('error', (code, signal) => {
      this.msg = 'Error while running process';
      msg.edit(this.codeMsg());
      msg.react('\u274E'); // :negative_squared_cross_mark:
    });
  });
}
