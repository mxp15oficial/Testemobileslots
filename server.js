// Exemplo mínimo: Express que chama a API de geração (OpenAI) e retorna o texto gerado.
// Requer: export OPENAI_API_KEY="sua_chave_aqui"
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/generate', async (req, res) => {
  try {
    const { message, language = 'html' } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not set' });

    // Prompt template -- peça AO MODELO para retornar apenas o código dentro de um bloco
    const prompt = `
Você é um assistente que gera código de um jogo de slot simples a pedido.
O usuário pede: "${message}"
Gere um arquivo completo em ${language} que implemente um slot machine jogável no navegador (ou na linguagem pedida).
Responda SOMENTE com o código (sem explicações). Se for HTML/JS, retorne um arquivo HTML completo.
Inclua comentários mínimos no código quando necessário.
`;

    // Chamada para a API de Chat (ajuste endpoint/model conforme sua conta)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // ajuste conforme disponiblidade
        messages: [
          { role: 'system', content: 'Você gera só código quando solicitado.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1600
      })
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return res.status(500).json({ error: 'No response from generation API', raw: data });

    res.json({ code: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
