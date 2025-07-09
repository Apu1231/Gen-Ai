import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";

const ai = new GoogleGenAI({ apiKey:"AIzaSyBsuwflgp5dhyXVVne8PDvnqq5SHQyqcng" });
const History = [];

function sum({ num1, num2 }) {
  return num1 + num2;
}

const sumDeclaration = {
  name: "sum",
  description: "Sum two numbers together",
  parameters: {
    type: "OBJECT",
    properties: {
      num1: {
        type: "NUMBER",
        description: "First number to add together ex: 10 or Ten",
      },
      num2: {
        type: "NUMBER",
        description: "Second number to add together ex: 10 or Ten",
      },
    },
    required: ["num1", "num2"],
  },
};

const availableTools = {
  sum: sum,
};

async function runAgent(userProblem) {
  History.push({
    role: "user",
    parts: [{ text: userProblem }],
  });

  while (true) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: History,
      config: {
        systemInstruction: `You are an AI Agent. You have access to tools like 'sum'. Use these tools when required to answer user queries. For general questions, answer directly if no tools are needed.`,
        tools: [
          {
            functionDeclarations: [sumDeclaration],
          },
        ],
      },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      // Log the function call details to track when the agent uses the function
      console.log("Agent is using function:", response.functionCalls[0]);

      const { name, args } = response.functionCalls[0];
      const funCall = availableTools[name];
      const result = await funCall(args);

      // Push the function call to history
      History.push({
        role: "model",
        parts: [
          {
            functionCall: response.functionCalls[0],
          },
        ],
      });

      // Push the function result to history as a function response
      History.push({
        role: "function",
        parts: [
          {
            functionResponse: {
              name: name,
              response: { result: result },
            },
          },
        ],
      });
    } else {
      // If no function calls, display the final response and break
      if (response.text) {
        console.log("Agent response:", response.text);
        History.push({
          role: "model",
          parts: [{ text: response.text }],
        });
      } else {
        console.log("Agent did not use a function or provide a text response.");
      }
      break;
    }
  }
}

async function main() {
  const userProblem = readlineSync.question("Ask me anything-=> ");
  await runAgent(userProblem);
  main();
}

main();