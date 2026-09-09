/**
 * Frontend API client for communicating with the Brain Dump Express backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export interface BackendDump {
  id: string;
  userId: string;
  content: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BackendTask {
  id: string;
  userId: string;
  title: string;
  sourceDumpTitle?: string;
  type?: "TODO" | "ROUTINE" | "PROJECT" | "IDEA";
  priority: "CRITICAL" | "HIGH" | "ROUTINE";
  timeframe?: string;
  dueDate: string;
  completed: boolean;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  error?: string;
}

/**
 * Check if the Express backend server is reachable.
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch all saved brain dumps strictly for the user: GET /api/dumps
 */
export async function getBackendDumps(userId?: string): Promise<BackendDump[]> {
  if (!userId) return [];

  const headers: Record<string, string> = { 
    "Content-Type": "application/json",
    "x-user-id": userId
  };

  const url = `${API_BASE_URL}/dumps?userId=${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to fetch dumps (Status: ${res.status})`);
  }

  const json: ApiResponse<BackendDump[]> = await res.json();
  return json.data || [];
}

/**
 * Save a new brain dump to the backend: POST /api/dumps
 */
export async function postBackendDump(content: string, userId?: string, metadata?: any): Promise<BackendDump> {
  if (!userId) {
    throw new Error("User ID is required to save a brain dump.");
  }

  const headers: Record<string, string> = { 
    "Content-Type": "application/json",
    "x-user-id": userId
  };

  const res = await fetch(`${API_BASE_URL}/dumps`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content, userId, metadata })
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to save dump (Status: ${res.status})`);
  }

  const json: ApiResponse<BackendDump> = await res.json();
  return json.data;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Verify active session with backend: GET /api/auth/me
 */
export async function verifySession(userId: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.user || null;
  } catch {
    return null;
  }
}

/**
 * Log in existing user via backend: POST /api/auth/login
 */
export async function loginUser(credentials: { email: string; password?: string }): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `Login failed (Status: ${res.status})`);
  }

  return json.data.user;
}

/**
 * Register new user / create ID: POST /api/auth/register
 */
export async function registerUser(details: { name: string; email: string; password?: string }): Promise<AuthUser> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details)
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `Registration failed (Status: ${res.status})`);
  }

  return json.data.user;
}

/**
 * Log out user from backend: POST /api/auth/logout
 */
export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.warn("Backend logout notification failed:", err);
  }
}

/**
 * Delete a brain dump from the backend: DELETE /api/dumps/:id
 */
export async function deleteBackendDump(id: string, userId?: string): Promise<boolean> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (userId) {
      headers["x-user-id"] = userId;
    }
    const res = await fetch(`${API_BASE_URL}/dumps/${id}`, {
      method: "DELETE",
      headers
    });
    return res.ok;
  } catch (err) {
    console.warn("Backend dump deletion failed:", err);
    return false;
  }
}

/**
 * Fetch all tasks for user: GET /api/tasks
 */
export async function getBackendTasks(userId?: string): Promise<BackendTask[]> {
  if (!userId) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      }
    });
    if (!res.ok) return [];
    const json: ApiResponse<BackendTask[]> = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/**
 * Save a manual task to the backend: POST /api/tasks
 */
export async function postBackendTask(task: Partial<BackendTask>, userId: string): Promise<BackendTask> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId
    },
    body: JSON.stringify(task)
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || "Failed to create task");
  }
  const json: ApiResponse<BackendTask> = await res.json();
  return json.data;
}

/**
 * Update task status (e.g. completion checkbox): PATCH /api/tasks/:id
 */
export async function updateBackendTask(taskId: string, updates: Partial<BackendTask>, userId: string): Promise<BackendTask | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) return null;
    const json: ApiResponse<BackendTask> = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

/**
 * Delete task from backend: DELETE /api/tasks/:id
 */
export async function deleteBackendTask(taskId: string, userId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      }
    });
    return res.ok;
  } catch {
    return false;
  }
}
