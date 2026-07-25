const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const express = require("express");

const client = new Client();
const app = express();

var listener = app.listen(process.env.PORT || 2000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

app.get('/', (req, res) => {
  res.send(`
  <body>
  <center><h1>Bot 24H ON!</h1></center>
  </body>`);
});

let voiceConnection = null;

async function joinVoice() {
  try {
    const channel = await client.channels.fetch(process.env.channel);
    if (!channel) {
      console.log('القناة غير موجودة');
      return;
    }

    // إذا في اتصال قديم، نمسحه
    if (voiceConnection) {
      voiceConnection.destroy();
      voiceConnection = null;
    }

    voiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: process.env.guild,
      selfMute: false,
      selfDeaf: false,
      adapterCreator: channel.guild.voiceAdapterCreator
    });

    await entersState(voiceConnection, VoiceConnectionStatus.Ready, 30_000);
    console.log('دخل الروم الصوتي بنجاح');

    // لو انفصل، نعيد الدخول
    voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.log('انفصل من الروم... جاري إعادة الدخول');
      try {
        await entersState(voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
      } catch {
        voiceConnection.destroy();
        voiceConnection = null;
        setTimeout(joinVoice, 2000);
      }
    });

  } catch (error) {
    console.log('خطأ في الدخول للروم:', error.message);
    setTimeout(joinVoice, 5000);
  }
}

client.on('ready', () => {
  console.log(`${client.user.username} is ready!`);
  joinVoice();
});

client.login(process.env.token);
