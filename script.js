const c = document.getElementById("c");
const i = document.getElementById("i");
const STORAGE_KEY = 'CHAT_HISTORY';

let m = [];

function getTime() {
    const d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map(n => String(n).padStart(2, '0')).join(':');
}

function buildMessage(content, role, time) {
    const div = document.createElement('div');
    div.style.margin = '6px 0';
    div.style.textAlign = role === 'user' ? 'right' : 'left';

    const contentSpan = document.createElement('span');
    contentSpan.textContent = content;
    contentSpan.style.display = 'block';
    div.appendChild(contentSpan);

    if (time) {
        const timeSpan = document.createElement('span');
        timeSpan.textContent = time;
        timeSpan.style.fontSize = '10px';
        timeSpan.style.color = '#aaa';
        timeSpan.style.display = 'block';
        div.appendChild(timeSpan);
    }

    return div;
}

function renderHistory() {
    m.forEach(msg => {
        c.appendChild(buildMessage(msg.content, msg.role, msg.time));
        c.appendChild(document.createElement('hr'));
    });
}

function saveChat() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
}

const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
    try {
        m = JSON.parse(saved);
        renderHistory();
    } catch (_) { m = []; }
}

const s = async () => {
    const userInput = i.value.trim();
    if (!userInput) return;

    const now = getTime();
    m.push({ role: "user", content: userInput, time: now });
    c.appendChild(buildMessage(userInput, 'user', now));
    c.appendChild(document.createElement('hr'));
    i.value = '';

    const assistantDiv = document.createElement('div');
    assistantDiv.style.margin = '6px 0';
    assistantDiv.style.textAlign = 'left';
    assistantDiv.innerHTML = '<span style="display:block;">...</span>';
    c.appendChild(assistantDiv);
    c.appendChild(document.createElement('hr'));
    const d = assistantDiv;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: m }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '请求失败');

        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('AI未返回内容');

        const aiTime = getTime();
        m.push({ role: 'assistant', content, time: aiTime });

        const newDiv = buildMessage(content, 'assistant', aiTime);
        d.replaceWith(newDiv);
        saveChat();
    } catch (e) {
        d.innerHTML = `<span style="display:block;color:red;">${e.message || '网络错误'}</span>`;
    }
};

const x = () => {
    m = [];
    c.innerHTML = '';
    localStorage.removeItem(STORAGE_KEY);
};

i.onkeydown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        s();
    }
};

window.s = s;
window.x = x;