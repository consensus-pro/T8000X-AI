const c = document.getElementById("c");
const i = document.getElementById("i");
const STORAGE_KEY = 'CHAT_HISTORY';

let m = [];
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
    try {
        m = JSON.parse(saved);
        m.forEach(msg => {
            const div = document.createElement('div');
            div.textContent = msg.content;
            if (msg.role === 'user') {
                div.style.textAlign = 'right';
            }
            c.appendChild(div);
            c.appendChild(document.createElement('hr'));
        });
    } catch (_) { m = []; }
}

function saveChat() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
}

const s = async () => {
    const userInput = i.value.trim();
    if (!userInput) return;

    m.push({ role: "user", content: userInput });
    const userDiv = document.createElement('div');
    userDiv.textContent = userInput;
    userDiv.style.textAlign = 'right';
    c.appendChild(userDiv);
    c.appendChild(document.createElement('hr'));
    i.value = "";

    const assistantDiv = document.createElement('div');
    assistantDiv.textContent = '...';
    c.appendChild(assistantDiv);
    c.appendChild(document.createElement('hr'));
    const d = assistantDiv;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: m }),
        });

        const data = await response.json();

        if (!response.ok) {
            d.textContent = `错误: ${data.error || '请求失败'}`;
            return;
        }

        const aiContent = data.choices?.[0]?.message?.content;
        if (!aiContent) {
            d.textContent = 'AI未返回有效内容';
            return;
        }

        m.push({ role: "assistant", content: aiContent });
        d.textContent = aiContent;
        saveChat();

    } catch (error) {
        d.textContent = '网络错误';
    }
};

const x = () => {
    m = [];
    c.innerHTML = "";
    localStorage.removeItem(STORAGE_KEY);
};

i.onkeydown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        s();
    }
};

window.s = s;
window.x = x;