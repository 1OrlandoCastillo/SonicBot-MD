const handler = async (m, { conn }) => {
  const ownerNumber = "5212731590195@s.whatsapp.net"; // Número del creador (WhatsApp internacional)
  const ownerName = "Orlando xz 🤖"; // Nombre visible del creador

  const messageText = `📞 *Contacto del Creador del Subbot:*

Si tienes dudas, preguntas o sugerencias sobre el funcionamiento de *SonicBot Subbot*, puedes contactar a su creador.

📌 *Nombre:* Orlando 
📌 *Número:* +52 1 273 159 0195
💬 *Toca el contacto para enviarle un mensaje directo.`;

  // Enviar contacto vCard
  await conn.sendMessage(m.key.remoteJid, {
    contacts: {
      displayName: ownerName,
      contacts: [
        {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;waid=${ownerNumber.split('@')[0]}:+${ownerNumber.split('@')[0]}\nEND:VCARD`
        }
      ]
    }
  });

  // Enviar texto informativo
  await conn.sendMessage(m.key.remoteJid, {
    text: messageText
  }, { quoted: m });
};

handler.command = /^(creador|creator|owner|dueño)$/i;
module.exports = handler;