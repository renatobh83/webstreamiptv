const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const app = express();
const auth = 'md147a:abc126ad';
const base64Auth = Buffer.from(auth).toString('base64');
// Caminho para ffmpeg.exe dentro do seu projeto
// const ffmpegPath = path.join(__dirname, 'ffmpeg', 'bin', 'ffmpeg.exe');
// ffmpeg.setFfmpegPath(ffmpegPath);
// Configurar FFmpeg
// ffmpeg.setFfmpegPath(ffmpegPath);

// Configurar EJS como view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Lista de streams disponíveis
const streams = [
    { name: 'Câmera 2', url: 'http://v1z.v156d1.xyz:80/404040/404040/141479.ts', id: 0 },
  // Adicione mais streams conforme necessário
];

// Rota principal
app.get('/', (req, res) => {
  res.render('index', { streams });
});

// Rota para exibir um stream específico
app.get('/stream/:id', (req, res) => {
    const stream = streams[req.params.id];
    console.log(stream)
  if (!stream) return res.status(404).send('Stream não encontrado');
  res.render('player', { stream });
});

app.get('/live/:id', (req, res) => {
  const streamUrl = streams[req.params.id]?.url;

  if (!streamUrl) return res.status(404).send('Stream não encontrado');

  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked'
  });

  ffmpeg()
    .input(streamUrl)
    .inputOptions([
      `-headers`, `Authorization: Basic ${base64Auth}`
    ])
    .outputOptions([
      '-f', 'mp4',
      '-movflags', 'frag_keyframe+empty_moov'
    ])
    .on('start', cmd => console.log('FFmpeg iniciado:', cmd))
    .on('error', err => {
      console.error('Erro no FFmpeg:', err.message);
      res.end();
    })
    .pipe(res, { end: true });
});
// Rota para o stream HTTP (transcodificação)
app.get('/live2/:id', (req, res) => {
  const streamUrl = streams[req.params.id]?.url;

  if (!streamUrl) return res.status(404).send('Stream não encontrado');

  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked'
  });

  ffmpeg()
  .input(streamUrl)
  .outputOptions([
    '-f', 'mp4',
    '-movflags', 'frag_keyframe+empty_moov'
  ])
  .on('start', cmd => console.log('FFmpeg iniciado:', cmd))
  .on('error', err => {
    console.error('Erro no FFmpeg:', err.message);
    res.end();
  })
  .on('end', () => console.log('Stream finalizado'))
  .pipe(res, { end: true });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});