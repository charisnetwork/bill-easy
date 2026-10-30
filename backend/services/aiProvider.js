/**
 * The one place Bill Easy talks to an AI model. Today: NVIDIA Nemotron through NVIDIA's
 * OpenAI-compatible API. Another provider (e.g. Azure OpenAI) is another branch in config();
 * callers never change.
 */
class AiUnavailableError extends Error {
  constructor(message = 'AI is unavailable right now. Please try again in a moment.') {
    super(message);
    this.status = 503;
    this.code = 'AI_UNAVAILABLE';
  }
}

const TIMEOUT_MS = 30 * 1000;

function config(source = process.env) {
  const provider = (source.AI_PROVIDER || 'nvidia').trim().toLowerCase();
  if (provider !== 'nvidia') throw new AiUnavailableError(`AI provider "${provider}" is not supported`);
  const key = source.NVIDIA_API_KEY?.trim();
  if (!key) throw new AiUnavailableError('AI is not configured on the server');
  return {
    url: `${(source.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').trim().replace(/\/+$/, '')}/chat/completions`,
    key,
    model: (source.NVIDIA_MODEL || 'nvidia/nemotron-3.5-lightning-30b-a3b').trim(),
  };
}

const parseArguments = (text) => {
  try { return JSON.parse(text || '{}'); } catch { return {}; }
};

/**
 * @param {{ messages: object[], tools?: object[], temperature?: number, maxTokens?: number, json?: boolean }} request
 * @returns {Promise<{ content: string, toolCalls: { id: string, name: string, arguments: object }[], message: object }>}
 */
async function chat({ messages, tools, temperature = 0.3, maxTokens = 800, json = false }) {
  const { url, key, model } = config();
  // Nemotron reasoning models otherwise spend the whole token budget thinking and return no text.
  const body = { model, messages, temperature, max_tokens: maxTokens, chat_template_kwargs: { enable_thinking: false } };
  if (tools?.length) body.tools = tools;
  if (json) body.response_format = { type: 'json_object' };
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new AiUnavailableError();
  }
  if (!response.ok) {
    console.warn(`[AI] provider returned ${response.status}`);
    throw new AiUnavailableError();
  }
  const message = (await response.json())?.choices?.[0]?.message;
  if (!message) throw new AiUnavailableError();
  const toolCalls = (message.tool_calls || []).map((call) => ({ id: call.id, name: call.function?.name, arguments: parseArguments(call.function?.arguments) }));
  return { content: (message.content || '').trim(), toolCalls, message };
}

module.exports = { AiUnavailableError, chat, config };
