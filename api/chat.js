export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('服务器错误: 未找到 DEEPSEEK_API_KEY 环境变量');
      return res.status(500).json({ error: '服务器配置错误' });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('DeepSeek API 错误:', data);
      return res.status(response.status).json({ error: data.error?.message || 'AI服务请求失败' });
    }

    res.status(200).json(data);

  } catch (error) {
    console.error('处理请求时发生异常:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
}
