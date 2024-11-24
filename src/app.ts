import { addKeyword, createBot, createFlow, createProvider, MemoryDB } from "@bot-whatsapp/bot"
import { BaileysProvider, handleCtx } from "@bot-whatsapp/provider-baileys"

const flowBienvenida = addKeyword("hola", async (bot, message) => {
    await bot.provider.sendText(message.from, "Hola! Soy un bot de bienvenida")
})

/**
 * 
 */
const main = async () => {

    const provider = createProvider(BaileysProvider)

    provider.initHttpServer(3002)

    provider.http.server.post("/send-message", handleCtx(async(bot, req, res) => {
        const phone = req.body.phone
        const message = req.body.message
        const urlMedia = req.body.media
        await bot.sendMessage(phone, '¡Hola! Aquí tienes tu recibo de la empresa Ranharvey. Si tienes alguna duda, no dudes en contactarnos. ¡Gracias por tu preferencia!', {})
        if (urlMedia){
            await bot.sendMessage(phone, message, {
                media: urlMedia
            })
        } 
        res.end('Mensaje enviado')
    }))


    const bot = createBot({
        flow: createFlow([flowBienvenida]),
        database: new MemoryDB(),
        provider
    })
}

main()
