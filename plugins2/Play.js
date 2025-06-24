const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const handler = async (msg, { conn, text }) => {
  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";

  const prefixPath = path.resolve("prefixes.json");
  let prefixes = {};
  if (fs.existsSync(prefixPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }

  const usedPrefix = prefixes[subbotID] || ".";

  if (!text) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${usedPrefix}play* peso pluma bye`
    }, { quoted: msg });
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: '🕒', key: msg.key }
  });

  try {
    const res = await axios.get(`https://theadonix-api.vercel.app/api/ytmp3?query=${encodeURIComponent(text)}`);
    const data = res.data;

    if (!data?.audio || !data.title) throw new Error("No se pudo obtener el audio");

    const { audio, title, duration, views, author, thumbnail, url } = data;

    const infoMessage = `

   ✦ SonicBot 2.0 𝗦𝘂𝗯𝗯𝗼𝘁 ✦

📀 *Info del audio:*  
❀ 🎼 *Título:* ${title}
❀ ⏱️ *Duración:* ${duration}
❀ 👁️ *Vistas:* ${views}
❀ 👤 *Autor:* ${author}
❀ 🔗 *Enlace:* ${url}

📥 *Opciones:*  
❀ 🎵 _${usedPrefix}play1 ${text}_
❀ 🎥 _${usedPrefix}play2 ${text}_
❀ 🎥 _${usedPrefix}play6 ${text}_
❀ ⚠️ *¿No se reproduce?* Usa _${usedPrefix}ff_

⏳ Procesando audio...
═══════════════════`;

    await conn.sendMessage(msg.key.remoteJid, {
      image: { url: thumbnail },
      caption: infoMessage
    }, { quoted: msg });

    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const rawPath = path.join(tmpDir, `${Date.now()}_raw.m4a`);
    const finalPath = path.join(tmpDir, `${Date.now()}_final.mp3`);

    const audioRes = await axios.get(audio, { responseType: 'stream' });
    await streamPipeline(audioRes.data, fs.createWriteStream(rawPath));

    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .format('mp3')
        .save(finalPath)
        .on('end', resolve)
        .on('error', reject);
    });

    await conn.sendMessage(msg.key.remoteJid, {
      audio: fs.readFileSync(finalPath),
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: msg });

    fs.unlinkSync(rawPath);
    fs.unlinkSync(finalPath);

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '✅', key: msg.key }
    });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(msg.key.remoteJid, {
      text: `❌ *Error:* ${err.message}`
    }, { quoted: msg });

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '❌', key: msg.key }
    });
  }
};

handler.command = ['play'];
module.exports = handler;