const EventEmitter = require('events');
const Discord = require('discord.js');
const express = require('express');
const request = require('request');
const winston = require('winston');
const path = require('path');
const fs = require('fs');

class Clementia {
  constructor(configFile) {
    this.app = express();
    this.client = new Discord.Client();
    this.events = new EventEmitter();
    this.commands = new EventEmitter();
    this.configPath = path.resolve(configFile);
    this.reloadConfig();
    this.log = new winston.Logger({
      level: this.config.loglevel,
      transports: [
        new winston.transports.Console({
          colorize: true,
          timestamp: true
        }),
        new winston.transports.File({
          filename: 'clementia.log'
        })
      ]
    });
    this.reloadEvents();
    this.reloadCommands();
    this.reloadStations();
    this.reloadViews();
    this.patchEmitter(this.client);
    request('http://ipinfo.io/country', (err, res, body) => {
      if (body) this.country = body.trim();
    });
  }

  reloadConfig(callback) {
    try {
      delete require.cache[require.resolve(this.configPath)];
      this.config = require(this.configPath);
      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }

  reloadStations(callback) {
    try {
      delete require.cache[require.resolve('./stations.json')];
      this.stations = require('./stations.json');
      this.log.debug('(Re)Loaded stations');
      if (callback) callback();
    } catch (err) {
      this.log.error(err);
      if (callback) callback(err);
    }
  }

  getEvent(event) {
    return function runEvent(...args) {
      try {
        return require(`./events/${event}`)(bot, ...args);
      } catch (err) {
        bot.log.error(err);
      }
    }
  }

  reloadEvents(callback) {
    try {
      this.events.removeAllListeners();
      const events = fs.readdirSync(path.resolve('./events'));
      for (const event of events) {
        if (event.endsWith('.js')) {
          delete require.cache[require.resolve(`./events/${event}`)];
          let eventName = event.slice(0, -3);
          this.events.on(eventName, this.getEvent(eventName));
          this.log.debug('(Re)Loaded event: %s', eventName);
        }
      }
      if (callback) callback();
    } catch (err) {
      this.log.error(err);
      if (callback) callback(err);
    }
  }

  getCommand(command) {
    return function runCommand(...args) {
      try {
        return require(`./commands/${command}`)(bot, ...args);
      } catch (err) {
        bot.log.error(err);
      }
    }
  }

  reloadCommands(callback) {
    try {
      this.commands.removeAllListeners();
      const commands = fs.readdirSync(path.resolve('./commands'));
      for (const command of commands) {
        if (command.endsWith('.js')) {
          delete require.cache[require.resolve(`./commands/${command}`)];
          let commandName = command.slice(0, -3);
          this.commands.on(commandName, this.getCommand(commandName));
          this.log.debug('(Re)Loaded command: %s', commandName);
        }
      }
      if (callback) callback();
    } catch (err) {
      this.log.error(err);
      if (callback) callback(err);
    }
  }

  reloadViews(callback) {
    try {
      this.app.routes = {};
      const views = fs.readdirSync(path.resolve('./views/public'));
      for (const view of views) {
        if (view.endsWith('.pug')) {
          let viewName = '' ? view === 'index.pug' : view.slice(0, -4);
          this.app.get(`/${viewName}`, (req, res) => {
            res.render(`public/${view}`, {
              title: viewName.replace(/^[a-z]/, x => x.toUpperCase()),
              bot: bot
            });
          });
          this.log.debug('(Re)Loaded view: %s', viewName);
        }
      }
      if (callback) callback();
    } catch (err) {
      this.log.error(err);
      if (callback) callback(err);
    }
  }

  patchEmitter(emitter) {
    const oldEmit = emitter.emit;

    emitter.emit = function() {
      oldEmit.apply(emitter, arguments);
      oldEmit.apply(bot.events, arguments);
    }
  }

  run() {
    this.client.login(this.config.token);
    if (typeof(this.config.listen) === 'object') {
      this.app.listen.apply(this.app, this.config.listen);
    } else {
      this.app.listen(this.config.listen || '/tmp/clementia.sock');
    }
    process.once('SIGINT', () => {
      this.log.info('Caught SIGINT; Exiting...');
      this.die();
    });
  }

  die() {
    this.client.destroy().then(() => {
      process.exit();
    });
  }
}

const bot = new Clementia('config.json');
bot.run();
