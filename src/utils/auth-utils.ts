let cachedToken: string | null = null;

export const getAccessToken = (): Promise<string> => {
  if (cachedToken) {
    return Promise.resolve(cachedToken);
  }

  const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
  if (!CLIENT_ID) {
    return Promise.reject(new Error("VITE_CLIENT_ID is not configured in environment variables."));
  }
  const OAUTH_URL = `${window.location.origin}/oauth-redirect.html`;
  const SCOPE = 'https://www.googleapis.com/auth/generative-language.peruserquota';
  const AUTH_POPUP_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(OAUTH_URL)}&response_type=token&scope=${encodeURIComponent(SCOPE)}`;
  const SIGNIN_TIMEOUT = 60000; // 60 seconds

  return new Promise((resolve, reject) => {
    const authWindow = window.open(AUTH_POPUP_URL, 'google-signin', 'width=600,height=700');

    let timeoutId: number | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('message', handleAuthMessage);
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }
    };

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.type === 'oauth_success' && event.data.response.access_token) {
        cleanup();
        cachedToken = event.data.response.access_token;
        resolve(event.data.response.access_token);
      } else if (event.data && event.data.type === 'oauth_error') {
        cleanup();
        reject(new Error(event.data.error || 'OAuth failed'));
      }
    };

    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error('Sign-in timed out. Please try again.'));
    }, SIGNIN_TIMEOUT);

    window.addEventListener('message', handleAuthMessage);
  });
};

export class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export const generateContent = async (accessToken: string, request: { model: string, contents: any }, additionalConfig?: any): Promise<any> => {
  const url = `https://generativelanguage.googleapis.com/v1alpha/models/${request.model}:generateContentPerUserQuota?access_token=${accessToken}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...additionalConfig, contents: request.contents }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', errorData);

    if (response.status === 429 || errorData.error?.status === 'RESOURCE_EXHAUSTED') {
      throw new QuotaExceededError(errorData.error?.message || 'Quota exceeded. Please upgrade.');
    }

    throw new Error(errorData.error?.message || 'Failed to get a response from the API.');
  }

  return response.json();
};
