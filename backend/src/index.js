require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const OpenAI = require('openai')
const fs = require('fs')
const { appendRow } = require('./sheets')

const app = express()
const upload = multer({ dest: 'uploads/' })

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Middlewares
app.use(cors())
app.use(express.json())

// Criar pasta de uploads se não existir
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads')
}

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Backend UV.Line funcionando!' })
})

// Rota para receber áudio e transcrever
app.post('/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' })
  }

  try {
    console.log('Arquivo recebido:', req.file)
    
    // Criar um arquivo temporário com extensão .webm
    const tempFilePath = req.file.path + '.webm'
    fs.renameSync(req.file.path, tempFilePath)
    
    // Enviar para o Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "pt"
    })

    console.log('Transcrição:', transcription.text)
    
    // Adicionar à planilha
    const store = req.body.store || 'Não especificada'
    await appendRow(store, transcription.text)
    
    // Limpar o arquivo após transcrição
    fs.unlinkSync(tempFilePath)

    res.json({ 
      message: 'Áudio processado com sucesso!',
      transcription: transcription.text 
    })

  } catch (error) {
    console.error('Erro detalhado:', error.message)
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (e) {
        console.error('Erro ao limpar arquivo:', e)
      }
    }
    res.status(500).json({ error: 'Erro ao processar o áudio: ' + error.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})