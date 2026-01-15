export type Expense = {
  _id?: string;
  title: string;
  amount: number;
  date: string; // ISO string
  category?: string;
  [key: string]: any;
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function handleRes(res: Response) {
  const text = await res.text();
  let payload: any;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!res.ok) throw new Error(payload?.message || res.statusText || "API error");
  return payload;
}

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch(`${API_BASE}/expenses`);
  return handleRes(res);
}

export async function getExpense(id: string): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses/${encodeURIComponent(id)}`);
  return handleRes(res);
}

export async function createExpense(payload: Partial<Expense>): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleRes(res);
}

export async function updateExpense(id: string, payload: Partial<Expense>): Promise<Expense> {
  const res = await fetch(`${API_BASE}/expenses/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleRes(res);
}

export async function deleteExpense(id: string): Promise<{ ok: boolean } | any> {
  const res = await fetch(`${API_BASE}/expenses/${encodeURIComponent(id)}`, { method: "DELETE" });
  return handleRes(res);
}

export default {
  fetchExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense
};
