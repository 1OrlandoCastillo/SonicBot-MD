const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const handler = async (msg, { conn, text, command }) => {
  // Obtener ID del subbot
  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";

  // Cargar prefijos personalizados
  const prefixPath = path.resolve("prefixes.json");
  let prefixes = {};
  if (fs.existsSync(prefixPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }

  const usedPrefix = prefixes[subbotID] || ".";

  if (!text) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: `🌴 Pon el nombre o link de un video para buscar.\n\n📌 Ejemplo:\n${usedPrefix + command} Yeri Mua vs Bellakath`
    }, { quoted: msg });
  }

  try {
    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '🕒', key: msg.key }
    });

    // Llamar a la API de Adonix
    const res = await fetch(`https://theadonix-api.vercel.app/api/ytmp3?query=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.result || !json.result.audio) {
      await conn.sendMessage(msg.key.remoteJid, {
        react: { text: '❌', key: msg.key }
      });
      return conn.sendMessage(msg.key.remoteJid, {
        text: '❌ No se pudo obtener el audio.'
      }, { quoted: msg });
    }

    const { title, audio, thumbnail, filename, duration, url } = json.result;

    const caption = `*「SonicBot 2.0」*\n\n` +
      `*❒ Título:* ${title}\n` +
      `*★ Duración:* ${duration}\n` +
      `*✧ Link:* ${url}\n\n` +
      `_Solicitado por @${msg.pushName || 'Usuario'}_\n\n` +
      `*❀ Servidor: Adonix API 🐦‍🔥*`;

    await conn.sendMessage(msg.key.remoteJid, {
      image: { url: thumbnail },
      caption: caption,
      mentions: [msg.sender]
    }, { quoted: msg });

    await conn.sendMessage(msg.key.remoteJid, {
      audio: { url: audio },
      mimetype: 'audio/mpeg',
      ptt: true,
      fileName: filename
    }, { quoted: msg });

    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '✅', key: msg.key }
    });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(msg.key.remoteJid, {
      react: { text: '❌', key: msg.key }
    });
    await conn.sendMessage(msg.key.remoteJid, {
      text: `❌ Error: ${err.message}`
    }, { quoted: msg });
  }
};

handler.command = ['play', 'ytmp3', 'playaudio'];
module.exports = handler;