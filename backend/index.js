const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { Uploadhandler } = require('./uploadFileHandler');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENAI_API_KEY;



app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: messages.join('\n') }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: GOOGLE_GENAI_API_KEY,
        },
      }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ reply });
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to communicate with Gemini API.' });
  }
});

app.post('/upload',Uploadhandler)
app.post('/', async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: messages.join('\n') }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: GOOGLE_GENAI_API_KEY,
        },
      }
    );

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ reply });
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to communicate with Gemini API.' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Gemini backend running at http://localhost:${PORT}`);
});
