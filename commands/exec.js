const cprocess = require('child_process');
const Discord = require('discord.js');
const request = require('request')

module.exports = async function(bot, message, args) {
  if (message.author.id !== bot.config.owner) {
    bot.reply('You are not authorized to use this command.');
    return;
  }

  this.outpart = '';
  this.msg = '';
  this.color = 0x0000FF;
  this.truncated = false;

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
    let output = this.msg.trim();
    let length = output.length + 8;
    if (length > 2048) {
      output = '[...]' + output.slice(-2035);
      this.truncated = true;
    }
    return new Discord.RichEmbed({
      title: 'Output',
      color: this.color,
      description: '```\n' + output + '\n```'
    });
  }

  message.channel.send({embed: {color: 0x0000FF}}).then(msg => {
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
      }
      if (code === 0) {
        this.color = 0x00FF00;
      } else {
        this.color = 0xFF0000;
      }
      var out = this.codeMsg();
      out.addField('Exit code', code);
      if (this.truncated) {
        request.post('https://pybin.pw/documents', {form: this.msg}, (err, res, body) => {
          let key = JSON.parse(body)['key'];
          out.addField('Full output', `https://pybin.pw/raw/${key}`);
        });
      }
      msg.edit(out);
    });

    proc.on('error', (code, signal) => {
      msg.edit({embed: {
        color: 0xFF0000,
        title: 'Error',
        description: 'Error while running process.'
      }});
    });
  });
}
