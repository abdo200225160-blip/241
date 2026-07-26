const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const express = require("express");

const client = new Client();
const app = express();

app.listen(process.env.PORT || 2000, () => {
  console.log('Server is running');
});

app.get('/', (req, res) => {
  res.send(`<center><h1>Bot 24H ON!</h1></center>`);
});

let voiceConnection = null;
let isJoining = false;

async function joinVoice() {
  if (isJoining) return;
  isJoining = true;

  try {
    const channel = await client.channels.fetch(process.env.channel);
    if (!channel) {
      isJoining = false;
      return;
    }

    // إذا الاتصال موجود وشغال → ما نسوي أي شيء
    if (voiceConnection && 
        voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) {
      isJoining = false;
      return;
    }

    // نمسح الاتصال القديم فقط إذا كان مدمر
    if (voiceConnection) {
      try { voiceConnection.destroy(); } catch {}
      voiceConnection = null;
    }

    voiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: process.env.guild,
      selfMute: false,
      selfDeaf: false,
      adapterCreator: channel.guild.voiceAdapterCreator
    });

    await entersState(voiceConnection, VoiceConnectionStatus.Ready, 15_000);
    console.log(`[${new Date().toLocaleTimeString()}] دخل الروم بنجاح`);

  } catch (error) {
    console.log('خطأ:', error.message);
    voiceConnection = null;
  }

  isJoining = false;
}

// يتحقق كل ثانية بدون ما يأثر على الاتصال
setInterval(() => {
  // فقط إذا مافي اتصال أو الاتصال مدمر → يعيد الدخول
  if (!voiceConnection || voiceConnection.state.status === VoiceConnectionStatus.Destroyed) {
    joinVoice();
  }
}, 1000); // كل ثانية

client.on('ready', () => {
  console.log(`${client.user.username} is ready!`);
  joinVoice();
});

client.login(process.env.token);
