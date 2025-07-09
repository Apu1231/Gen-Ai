import { VertexAI } from '@google-cloud/vertexai';
import readlineSync from 'readline-sync';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { GoogleAuth } from 'google-auth-library';
const platform = os.platform();


const asyncExecute = promisify(exec);
const auth = new GoogleAuth({
    apiKey: 'AIzaSyA2UCE2Vk2vsG9UxzWJuNnxfnVHActKmzI', // Your API key
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const vertexAI = new VertexAI({
    project: '5th model',
    location: 'Apurba@DESKTOP-2AJUREN MINGW64 ~/Desktop/Gen Ai/5th model ',
    authClient: auth,
});

const generativeModel = vertexAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
});


const History = [];

async function executeComand({ comand }) {
    try {
        const { stdout, stderr } = await asyncExecute(comand, { shell: 'bash' });
        if (stderr) {
            return `Error: ${stderr}`;
        }
        return `Success: ${stdout}`;
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

const executeComandDeclaration = {
    name: 'executeComand',
    description: 'Execute a single terminal/shell command. A command can create a folder, file, write to a file, edit a file, or delete a file.',
    parameters: {
        type: 'OBJECT',
        properties: {
            comand: {
                type: 'STRING',
                description: 'A single terminal command. EX: "mkdir calculator" or "cat << EOF > calculator/index.html"',
            },
        },
        required: ['comand'],
    },
};

const availableTools = {
    executeComand,
};

async function runAgent(userProblem) {
    History.push({
        role: 'user',
        parts: [{ text: userProblem }],
    });

    while (true) {
        try {
            const request = {
                contents: History,
                tools: [
                    {
                        function_declarations: [executeComandDeclaration],
                    },
                ],
                systemInstruction: {
                    role: 'model',
                    parts: [{
                        text: `You are a website builder expert. You have to create the frontend of the website by analyzing the user input. You have access to a tool that can run or execute any shell or terminal command.

                        Current user operating system is: ${platform}
                        The user is running commands in Git Bash on Windows, so use Unix-compatible commands (e.g., mkdir, touch, cat).

                        <--what is your job-->
                        1: Analyze the user query
                        2: Give them commands one by one, step by step
                        3: Use the available tool executeComand

                        // Now you can give them commands as follows:

                        1: First create a folder. ex: mkdir calculator
                        2: Inside the folder, create an index.html file. ex: touch calculator/index.html
                        3: Then create a style.css file. ex: touch calculator/style.css
                        4: Then create a script.js file. ex: touch calculator/script.js
                        5: Write code to a file (e.g., index.html) using cat with EOF for multi-line content. ex:
                           cat << EOF > calculator/index.html
                           <!DOCTYPE html>
                           <html lang="en">
                           <head>
                               <meta charset="UTF-8">
                               <title>Calculator</title>
                           </head>
                           <body>
                               <!-- HTML content -->
                           </body>
                           </html>
                           EOF

                        Ensure all commands are compatible with Git Bash on Windows. For writing multi-line content, always use 'cat << EOF > filename' and ensure the closing 'EOF' is on a new line with no leading/trailing spaces. Provide the full content for files like index.html, style.css, or script.js when needed. If the user requests a calculator website, include the full HTML, CSS, and JavaScript content in the respective files using cat << EOF.`,
                    }],
                },
            };

            const response = await generativeModel.generateContent(request);

            if (response.candidates && response.candidates[0].content.parts) {
                const parts = response.candidates[0].content.parts;
                const functionCall = parts.find(part => part.functionCall);

                if (functionCall) {
                    console.log('Agent is using function:', functionCall);
                    const { name, args } = functionCall.functionCall;
                    const funCall = availableTools[name];
                    const result = await funCall(args);

                    History.push({
                        role: 'model',
                        parts: [{ functionCall }],
                    });

                    History.push({
                        role: 'function',
                        parts: [{
                            functionResponse: {
                                name: name,
                                response: { result: result },
                            },
                        }],
                    });
                } else {
                    const text = parts.find(part => part.text)?.text;
                    if (text) {
                        console.log('Agent response:', text);
                        History.push({
                            role: 'model',
                            parts: [{ text }],
                        });
                    } else {
                        console.log('Agent did not use a function or provide a text response.');
                    }
                    break;
                }
            } else {
                console.log('No valid response from the model.');
                break;
            }
        } catch (error) {
            console.error('Error in runAgent:', error.message);
            break;
        }
    }
}

async function main() {
    console.log("i am a cursor: let's create a website");
    const userProblem = readlineSync.question("Ask me anything (type 'exit' to quit)-=> ");
    if (userProblem.toLowerCase() === 'exit') {
        console.log('Exiting...');
        return;
    }
    await runAgent(userProblem);
    main();
}

main();