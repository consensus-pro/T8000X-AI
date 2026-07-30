const AI_DATA = process.env.AI_DATA || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error('服务器错误: 未找到 API_KEY 环境变量');
      return res.status(500).json({ error: '服务器配置错误' });
    }

    const messagesToSend = [];
    if (AI_DATA) {
      messagesToSend.push({ role: "system", content: AI_DATA });
    }
    messagesToSend.push(...messages);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-pro',
        messages: messagesToSend,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API接口 错误:', data);
      return res.status(response.status).json({ error: data.error?.message || '接口请求失败' });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error('处理请求时发生异常:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
}
