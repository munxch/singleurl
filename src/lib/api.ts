import { API_CONFIG } from './constants';
import { PlaygroundRunResponse, SessionResponse } from '@/types';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_CONFIG.AUTH_TOKEN}`,
  'X-Auth-Token': API_CONFIG.AUTH_TOKEN,
});

export async function runPlaygroundQuery(userMessage: string): Promise<PlaygroundRunResponse> {
  const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/playground/runs`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ user_message: userMessage }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getSessionStatus(sessionId: string): Promise<SessionResponse> {
  const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/sessions/${sessionId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get session status: ${response.status}`);
  }

  return response.json();
}
