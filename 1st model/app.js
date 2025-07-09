import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';

const History = [];

const ai = new GoogleGenAI({ apiKey: "AIzaSyChAM41E5enOFm6BCiLH9uTR_2EcpVFS-c" });

async function main(userProblem) {
    if (!userProblem) {
        console.log("Please provide a valid input.");
        return;
    }

    History.push({
        role: "user",
        parts: [{ text: userProblem }]
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

    console.log(responseText);
}

async function askQuestion() {
    const userProblem = readlineSync.question("Ask a question:  ");
    await main(userProblem);
    askQuestion();
}

askQuestion();
