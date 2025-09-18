// app.js
const express = require("express");
const { createBot, createProvider, createFlow } = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const fs = require("fs");

const app = express();
app.use(express.json());

let providerInstance = null;

async function initBot() {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([]);
  const provider = createProvider(BaileysProvider);

  providerInstance = provider;

  await createBot({
    flow: adapterFlow,
    provider,
    database: adapterDB,
  });

  QRPortalWeb();
  console.log("🤖 Bot inicializado. Escanea el QR si aún no lo hiciste.");
}

initBot().catch((err) => {
  console.error("Error iniciando el bot:", err);
});

// --- Endpoint para enviar PDF desde una URL ---
app.post("/send-pdf", async (req, res) => {
  try {
    const { phone, pdfUrl } = req.body;
    if (!phone || !pdfUrl) {
      return res.status(400).json({ error: "phone y pdfUrl son requeridos" });
    }

    if (!providerInstance) {
      return res
        .status(503)
        .json({ error: "Provider no inicializado aún. Espera unos segundos." });
    }

    const jid = `${phone}@s.whatsapp.net`;

    // 1️⃣ Enviar mensaje primero
    const messageText = `¡Hola! 📄 Aquí tienes tu recibo de la empresa *Ranharvey*.\n\nSi tienes alguna duda, no dudes en contactarnos.\n\n¡Gracias por preferirnos! 🙌`;

    await providerInstance.sendText(jid, messageText);

    // 🔄 Pequeño delay de 1 segundo antes de mandar el PDF
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 2️⃣ Luego enviar el PDF
    await providerInstance.sendMedia(jid, pdfUrl, {
      filename: "recibo.pdf",
      mimetype: "application/pdf",
      caption: "📄 Recibo de Ranharvey",
    });

    return res.json({
      success: true,
      message: `Mensaje y PDF enviados a ${phone}`,
    });
  } catch (error) {
    console.error("❌ Error al enviar PDF:", error);
    return res.status(500).json({ error: "Error enviando PDF" });
  }
});

app.listen(3002, () => {
  console.log("🚀 Servidor escuchando en http://localhost:3002");
});
