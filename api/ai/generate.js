const REQUEST_TIMEOUT_MS = 30000;

const normalizeProvider = (provider) => {
  const normalized = (provider || '').trim().toLowerCase();
  if (normalized === 'qwen' || normalized === 'tongyi' || normalized === 'tongyi-qianwen' || normalized === 'dashscope') {
    return 'qwen';
  }
  if (normalized === 'openai' || normalized === 'openai-compatible' || normalized === 'compatible') {
    return 'openai-compatible';
  }
  if (normalized === 'deepseek') {
    return 'deepseek';
  }
  return 'gemini';
};

const inferProvider = () => {
  if (process.env.AI_PROVIDER || process.env.VITE_AI_PROVIDER) {
    return normalizeProvider(process.env.AI_PROVIDER || process.env.VITE_AI_PROVIDER);
  }

  const configuredModel = process.env.AI_MODEL || process.env.VITE_AI_MODEL || process.env.VITE_GEMINI_MODEL || '';

  if (process.env.DASHSCOPE_API_KEY || /qwen|qwq/i.test(configuredModel)) {
    return 'qwen';
  }

  if (process.env.DEEPSEEK_API_KEY || /deepseek/i.test(configuredModel)) {
    return 'deepseek';
  }

  if (
    process.env.AI_BASE_URL ||
    process.env.VITE_AI_BASE_URL ||
    process.env.AI_API_KEY ||
    process.env.VITE_AI_API_KEY ||
    process.env.OPENAI_API_KEY
  ) {
    return 'openai-compatible';
  }

  return 'gemini';
};

const resolveApiKey = (provider) => {
  if (provider === 'qwen') {
    return process.env.AI_API_KEY || process.env.VITE_AI_API_KEY || process.env.DASHSCOPE_API_KEY || '';
  }

  if (provider === 'deepseek') {
    return process.env.AI_API_KEY || process.env.VITE_AI_API_KEY || process.env.DEEPSEEK_API_KEY || '';
  }

  if (provider === 'openai-compatible') {
    return process.env.AI_API_KEY || process.env.VITE_AI_API_KEY || process.env.OPENAI_API_KEY || '';
  }

  return process.env.AI_API_KEY || process.env.VITE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
};

const resolveDefaultModel = (provider) => {
  if (provider === 'qwen') {
    return process.env.AI_MODEL || process.env.QWEN_MODEL || process.env.VITE_AI_MODEL || 'qwen-flash';
  }

  if (provider === 'deepseek') {
    return process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || process.env.VITE_AI_MODEL || 'deepseek-chat';
  }

  if (provider === 'openai-compatible') {
    return process.env.AI_MODEL || process.env.OPENAI_MODEL || process.env.VITE_AI_MODEL || 'gpt-4o-mini';
  }

  return process.env.AI_MODEL || process.env.GEMINI_MODEL || process.env.VITE_AI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
};

const resolveBaseUrl = (provider) => {
  const configuredBaseUrl = process.env.AI_BASE_URL || process.env.VITE_AI_BASE_URL || process.env.OPENAI_BASE_URL;
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }

  if (provider === 'qwen') {
    return 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  }

  if (provider === 'deepseek') {
    return 'https://api.deepseek.com/v1';
  }

  if (provider === 'openai-compatible') {
    return 'https://api.openai.com/v1';
  }

  return 'https://generativelanguage.googleapis.com/v1beta';
};

const parseGeminiText = (data) => data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

const parseOpenAICompatibleText = (data) => {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part) return part.text || '';
        return '';
      })
      .join('');
  }
  return '';
};

const buildUpstreamRequest = ({ provider, apiKey, baseUrl, model, prompt, systemInstruction, responseMimeType }) => {
  if (provider === 'qwen' || provider === 'deepseek' || provider === 'openai-compatible') {
    const body = {
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      ...(responseMimeType === 'application/json' ? { response_format: { type: 'json_object' } } : {})
    };

    return {
      providerLabel: provider,
      url: `${baseUrl}/chat/completions`,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body,
      parseText: parseOpenAICompatibleText
    };
  }

  return {
    providerLabel: 'gemini',
    url: `${baseUrl}/models/${model}:generateContent?key=${apiKey}`,
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType,
        temperature: 0.2
      }
    },
    parseText: parseGeminiText
  };
};

const sendJson = (res, statusCode, payload) => {
  res.status(statusCode).json(payload);
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: { message: 'Method Not Allowed' } });
    return;
  }

  const provider = inferProvider();
  const apiKey = resolveApiKey(provider);
  const defaultModel = resolveDefaultModel(provider);
  const baseUrl = resolveBaseUrl(provider);

  if (!apiKey) {
    sendJson(res, 500, {
      error: {
        message:
          `API key for provider ${provider} is not configured on the server. ` +
          `Please set AI_API_KEY (or VITE_AI_API_KEY) and AI_PROVIDER in Vercel environment variables.`
      }
    });
    return;
  }

  try {
    const body = req.body || {};
    const prompt = typeof body.prompt === 'string' ? body.prompt : '';
    const systemInstruction = typeof body.systemInstruction === 'string' ? body.systemInstruction : '';
    const responseMimeType = typeof body.responseMimeType === 'string' ? body.responseMimeType : 'text/plain';
    const model = typeof body.model === 'string' && body.model ? body.model : defaultModel;

    if (!prompt.trim()) {
      sendJson(res, 400, { error: { message: 'prompt is required' } });
      return;
    }

    const upstreamRequest = buildUpstreamRequest({
      provider,
      apiKey,
      baseUrl,
      model,
      prompt,
      systemInstruction,
      responseMimeType
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const upstreamRes = await fetch(upstreamRequest.url, {
      method: 'POST',
      headers: upstreamRequest.headers,
      body: JSON.stringify(upstreamRequest.body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const rawResponse = await upstreamRes.text();
    let parsedResponse = {};
    try {
      parsedResponse = rawResponse ? JSON.parse(rawResponse) : {};
    } catch {
      parsedResponse = {};
    }

    if (!upstreamRes.ok) {
      sendJson(res, upstreamRes.status, {
        error: {
          message: parsedResponse?.error?.message || rawResponse || `${upstreamRequest.providerLabel} request failed`
        }
      });
      return;
    }

    const text = upstreamRequest.parseText(parsedResponse);
    if (!text) {
      sendJson(res, 502, { error: { message: `${upstreamRequest.providerLabel} returned an empty response` } });
      return;
    }

    sendJson(res, 200, { text });
  } catch (error) {
    if (error instanceof SyntaxError) {
      sendJson(res, 400, { error: { message: 'Invalid JSON body' } });
      return;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      sendJson(res, 504, { error: { message: 'AI request timed out' } });
      return;
    }

    sendJson(res, 500, {
      error: {
        message: error instanceof Error ? error.message : 'Unknown server error'
      }
    });
  }
}