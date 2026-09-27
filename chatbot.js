const chatToggle = document.getElementById('chatbot-toggle');
const chatWindow = document.getElementById('chatbot');
const closeChat = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-chat');
const inputField = document.getElementById('chat-input');
const messagesArea = document.getElementById('chat-messages');

chatToggle.addEventListener('click', () => {
    chatWindow.style.display = 'flex';
    chatToggle.style.display = 'none';
    if(messagesArea.children.length === 0) {
        addMessage("Hi! I'm the SkySync AI. Ask me if it's safe to travel in your selected region, or why the forecast might bust today.", 'bot');
    }
});

closeChat.addEventListener('click', () => {
    chatWindow.style.display = 'none';
    chatToggle.style.display = 'flex';
});

sendBtn.addEventListener('click', handleSend);
inputField.addEventListener('keypress', (e) => { if(e.key === 'Enter') handleSend(); });

function addMessage(text, sender) {
    const el = document.createElement('div');
    el.className = `msg ${sender}`;
    el.innerHTML = text; // allow bolding
    messagesArea.appendChild(el);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function handleSend() {
    const text = inputField.value.trim();
    if(!text) return;
    addMessage(text, 'user');
    inputField.value = '';
    
    setTimeout(() => {
        const response = generateAIResponse(text.toLowerCase());
        addMessage(response, 'bot');
    }, 600);
}

function generateAIResponse(msg) {
    const data = window.currentWeatherData;
    const region = window.currentRegionName;
    
    if (!data) return "Please select a region on the dashboard map first so I can analyze the NWP data.";

    if (msg.includes("go out") || msg.includes("travel") || msg.includes("safe")) {
        if (data.bustProb > 60 || data.wind > 35 || data.precip > 15) {
            return `🚨 **Caution advised in ${region}.** The forecast bust probability is high at **${data.bustProb}%**, meaning conditions could change rapidly. We are tracking ${data.wmoText} with wind gusts up to ${data.wind} km/h. Keep an umbrella and verify radar before stepping out.`;
        } else {
            return `✅ **It looks safe to head out in ${region}.** The forecast is stable (Confidence: ${data.confidence}%). Expect ${data.wmoText} with a high of ${data.tempMax}°C.`;
        }
    }
    
    if (msg.includes("bust") || msg.includes("why") || msg.includes("explain")) {
        let reasons = data.factors.map(f => f.name).join(' and ');
        return `The current bust probability in ${region} is **${data.bustProb}%**. This uncertainty is primarily driven by **${reasons}**.`;
    }
    
    return "I analyze weather model volatility. Try asking: 'Is it safe to go out today?' or 'What is the bust probability?'";
}