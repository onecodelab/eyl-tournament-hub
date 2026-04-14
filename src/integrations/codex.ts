const CODEX_BASE_URL = import.meta.env.VITE_CODEX_BASE_URL;
const CODEX_API_KEY = import.meta.env.VITE_CODEX_API_KEY;

function getCodexHeaders() {
  if (!CODEX_BASE_URL || !CODEX_API_KEY) {
    throw new Error(
      "Missing environment variables: VITE_CODEX_BASE_URL and VITE_CODEX_API_KEY must be defined."
    );
  }

  return {
    Authorization: `Bearer ${CODEX_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export type CodexCompletionOptions = {
  model?: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop?: string | string[];
};

export async function createCodexCompletion<T = unknown>(
  options: CodexCompletionOptions
): Promise<T> {
  const headers = getCodexHeaders();

  const response = await fetch(`${CODEX_BASE_URL}/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: options.model ?? "text-davinci-003",
      prompt: options.prompt,
      max_tokens: options.max_tokens ?? 256,
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 1,
      stop: options.stop,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Codex request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export async function codexRequest<T = unknown>(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<T> {
  const headers = getCodexHeaders();

  const response = await fetch(`${CODEX_BASE_URL}/${endpoint.replace(/^\//, "")}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Codex request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}
