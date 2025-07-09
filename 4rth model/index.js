import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const platform = os.platform();
const asyncExecute = promisify(exec);

const ai = new GoogleGenAI({ apiKey: "AIzaSyCxQ3ih6EZcID1nwrCJPhwrQ0HUIuvmBac" });


const History = [];

async function executeComand({ comand }) {
    try {
        const { stdout, stderr } = await asyncExecute(comand);
        if (stderr) {
            return `Error ${stderr}`;
        }
        return `Success: ${stdout}`;
    } catch (error) {
        return `Error ${error} || Task executed successfully`;
    }
}

const executeComandDeclaration = {
    name: "executeComand",
    description: "Execute a single terminal/shell comand. A comand can be create a folder, file, write on a file, edit the file or delete the file",
    parameters: {
        type: "OBJECT",
        properties: {
            comand: {
                type: "STRING",
                description: 'It will be a single terminal comand. EX: "mkdir calculator" or "cat << EOF > calculator/index.html"',
            },
        },
        required: ["comand"],
    },
};

const availableTools = {
    executeComand,
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
                systemInstruction: `You are a website builder expert. You have to create the frontend of the website by analyzing the user input. You have access to a tool that can run or execute any shell or terminal command.

                Current user operating system is: ${platform}
                Give commands to the user according to their operating system support.

                <--what is your job-->
                1: Analyze the user query
                2: Give them commands one by one, step by step
                3: Use the available tool executeComand

                // Now you can give them commands as follows:

                1: First create a folder. ex: mkdir "calculator"
                2: Inside the folder, create an index.html file. ex: touch "calculator/index.html"
                3: Then create a style.css file. ex: touch "calculator/style.css"
                4: Then create a script.js file. ex: touch "calculator/script.js"
                # This is the PowerShell equivalent of cat << 'EOF' > script.js

                @'
                const calculator = {
                displayValue: '0',
                firstOperand: null,
                waitingForSecondOperand: false,
                operator: null,
                };

                function updateDisplay() {
                const display = document.querySelector('.calculator-screen');
                display.value = calculator.displayValue;
                }

                // ... rest of the valid JavaScript code ...
                updateDisplay();
                '@ | Set-Content -Path "script.js"
                Use this method to write the content in the file.
                                                  `,
                tools: [
                    {
                        functionDeclarations: [executeComandDeclaration],
                    },
                ],
            },
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            console.log("Agent is using function:", response.functionCalls[0]);
            const { name, args } = response.functionCalls[0];
            const funCall = availableTools[name];
            const result = await funCall(args);

            History.push({
                role: "model",
                parts: [
                    {
                        functionCall: response.functionCalls[0],
                    },
                ],
            });

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
    console.log("i am a cursor: let's create a website");
    const userProblem = readlineSync.question("Ask me anything (type 'exit' to quit)-=> ");
    if (userProblem.toLowerCase() === 'exit') {
        console.log("Exiting...");
        return;
    }
    await runAgent(userProblem);
    main();
}

main();