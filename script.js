
async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value;
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    // //for locally run  
    // const response = await fetch('http://localhost:3000/ask', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ message })
        // }); 
        //For Deployment like netlify vercel github etc
    const response = await fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });


    const data = await response.json();
    addMessage(data.reply, 'bot');
}

function addMessage(text, sender) {
    const messagesDiv = document.getElementById('messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + sender;
    msgDiv.innerText = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
