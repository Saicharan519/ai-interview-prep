// Streams interviewer feedback from the backend SSE endpoint.
//
// SSE was chosen over WebSockets because the channel is one-way (server -> client)
// and runs over plain HTTP. EventSource can't send POST bodies, so we use fetch
// with a ReadableStream and parse frames manually.
export async function streamEvaluation({
  reportId,
  question,
  userAnswer,
  signal,
  onChunk,
  onDone,
  onError,
}) {
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_BASE_URL || '';

  let res;
  try {
    res = await fetch(`${base}/api/reports/${reportId}/interview/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ question, userAnswer }),
      signal,
    });
  } catch (err) {
    onError?.(err);
    return;
  }

  if (!res.ok || !res.body) {
    onError?.(new Error(`Request failed with status ${res.status}`));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line. A network chunk may split a
      // frame mid-message, so we keep the last incomplete piece in the buffer.
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';

      for (const frame of frames) {
        const line = frame.trim();
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();

        if (payload === '[DONE]') {
          onDone?.();
          return;
        }

        try {
          const parsed = JSON.parse(payload);
          if (parsed.error) {
            onError?.(new Error(parsed.error));
            return;
          }
          if (typeof parsed.text === 'string') onChunk?.(parsed.text);
        } catch {
          /* ignore malformed frames */
        }
      }
    }
    onDone?.();
  } catch (err) {
    if (err.name !== 'AbortError') onError?.(err);
  }
}
