import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());
app.use(express.json());

const History = [];

const ai = new GoogleGenAI({ apiKey: "AIzaSyChAM41E5enOFm6BCiLH9uTR_2EcpVFS-c" });

app.post('/ask', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    History.push({
        role: "user",
        parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: History,
    });

    const responseText = response.candidates[0].content.parts[0].text;

    History.push({
        role: "model",
        parts: [{ text: responseText }]
    });

    res.json({ reply: responseText });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
