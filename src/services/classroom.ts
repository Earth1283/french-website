import { useClassroomStore } from '../stores/classroomStore';

export class ClassroomApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const err = (body as { error?: unknown }).error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const flat = err as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
    const messages = [
      ...(flat.formErrors ?? []),
      ...Object.values(flat.fieldErrors ?? {}).flat(),
    ];
    if (messages.length) return messages.join(', ');
  }
  return null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { backendUrl, token } = useClassroomStore.getState();
  if (!backendUrl) throw new ClassroomApiError('Not connected to a classroom server', 0);

  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${backendUrl}${path}`, { ...options, headers });
  } catch {
    throw new ClassroomApiError('Could not reach the classroom server', 0);
  }

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ClassroomApiError(extractErrorMessage(body) ?? `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

export const classroomApi = {
  health: () => request<{ ok: boolean; requiresTeacherSetup: boolean; allowOpenTeacherSignup: boolean }>('/api/health'),

  teacherRegister: (data: { name: string; email: string; password: string; signupCode?: string }) =>
    request<{ token: string; teacher: { id: string; name: string; email: string } }>('/api/auth/teacher/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  teacherLogin: (data: { email: string; password: string }) =>
    request<{ token: string; teacher: { id: string; name: string; email: string } }>('/api/auth/teacher/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  studentRegister: (data: { name: string; email: string; password: string }) =>
    request<{ token: string; student: { id: string; name: string; email: string } }>('/api/auth/student/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  studentLogin: (data: { email: string; password: string }) =>
    request<{ token: string; student: { id: string; name: string; email: string } }>('/api/auth/student/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PUT', body: data !== undefined ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: 'PATCH', body: data !== undefined ? JSON.stringify(data) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
