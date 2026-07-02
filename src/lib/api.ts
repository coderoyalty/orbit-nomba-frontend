import { http } from "./http";

// =====================================================================
// Types that mirror the backend (Prisma schema + DTOs)
// =====================================================================

export type Interval = "day" | "week" | "month" | "year";

export interface Account {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Price {
  id: string;
  unit_amount: number; // kobo
  billing_interval: Interval;
  billing_interval_count: number;
  is_active: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  trial_days: number;
  prices: Price[];
  createdAt: string;
}

export interface ApiKeyResult {
  // shape depends on backend; key shown once on generation
  key?: string;
  key_prefix?: string;
}

// ---- UI-side billing-interval choices, mapped to the backend pair ----
export type BillingChoice = "monthly" | "annual" | "bi-annual" | "custom";

export function choiceToInterval(
  choice: BillingChoice,
  customDays: number,
): { interval: Interval; interval_count: number } {
  switch (choice) {
    case "monthly":
      return { interval: "month", interval_count: 1 };
    case "annual":
      return { interval: "year", interval_count: 1 };
    case "bi-annual":
      return { interval: "month", interval_count: 6 };
    case "custom":
      return { interval: "day", interval_count: Math.max(1, customDays) };
  }
}

// =====================================================================
// AUTH  (real — /dashboard/auth/*, cookie-based)
// =====================================================================
export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    http.post<{ id: string }>("/dashboard/auth/register", body),

  // login sets the orbit_session cookie server-side; body is just a message
  login: (body: { email: string; password: string }) =>
    http.post<unknown>("/dashboard/auth/login", body),

  logout: () => http.post<void>("/dashboard/auth/logout"),

  // used as the session check — 200 = logged in, 401 = not
  me: () => http.get<Account>("/dashboard/auth/me"),
};

// =====================================================================
// PROJECTS  (real — /dashboard/projects)
// =====================================================================
export const projectsApi = {
  list: () => http.get<Project[]>("/dashboard/projects"),
  create: (body: { name: string; description: string }) =>
    http.post<Project>("/dashboard/projects", body),
  remove: (id: string) => http.del<void>(`/dashboard/projects/${id}`),
  generateKeys: (id: string) =>
    http.post<ApiKeyResult>(`/dashboard/projects/${id}/keys`),
};

// =====================================================================
// PLANS  (real — nested under a project)
// =====================================================================
export interface CreatePlanInput {
  name: string;
  description: string;
  trial_days?: number;
  price: {
    interval: Interval;
    interval_count: number;
    unit_amount: number; // kobo
  };
}

export interface UpdatePlanInput {
  name: string;
  description: string;
}

export interface AddPriceInput {
  interval: Interval;
  interval_count: number;
  unit_amount: number; // kobo
}

export interface ChangePriceInput {
  unit_amount: number; // kobo
}

export const plansApi = {
  list: (projectId: string) =>
    http.get<Plan[]>(`/dashboard/projects/${projectId}/plans`),
  get: (projectId: string, planId: string) =>
    http.get<Plan>(`/dashboard/projects/${projectId}/plans/${planId}`),
  create: (projectId: string, input: CreatePlanInput) =>
    http.post<Plan>(`/dashboard/projects/${projectId}/plans`, input),
  update: (projectId: string, planId: string, input: UpdatePlanInput) =>
    http.patch<Plan>(`/dashboard/projects/${projectId}/plans/${planId}`, input),
  remove: (projectId: string, planId: string) =>
    http.del<void>(`/dashboard/projects/${projectId}/plans/${planId}`),
  addPrice: (projectId: string, planId: string, input: AddPriceInput) =>
    http.post<Plan>(`/dashboard/projects/${projectId}/plans/${planId}/prices`, input),
  archivePrice: (projectId: string, planId: string, priceId: string) =>
    http.del<Plan>(`/dashboard/projects/${projectId}/plans/${planId}/prices/${priceId}/archive`),
  changePrice: (projectId: string, planId: string, priceId: string, input: ChangePriceInput) =>
    http.post<Plan>(`/dashboard/projects/${projectId}/plans/${planId}/prices/${priceId}/change-price`, input),
  cancelSubscriptions: (projectId: string, planId: string) =>
    http.post<void>(`/dashboard/projects/${projectId}/plans/${planId}/cancel-subscriptions`),
};

// =====================================================================
// NOT YET ON THE BACKEND — mocked with the real URL shape stubbed.
// Replace each body with http.* once the controllers ship.
// =====================================================================
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export type SubscriptionState =
  | "incomplete"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";

export interface BackendCustomer {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  createdAt: string;
  metadata?: string;
  environment: "live" | "test";
}

export interface BackendPaymentMethod {
  id: string;
  last4: string;
  brand: string;
  createdAt: string;
}

export interface BackendSubscription {
  id: string;
  status: SubscriptionState;
  customer_id: string;
  price_id: string;
  payment_method_id: string | null;
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  createdAt: string;
  environment: "live" | "test";
  
  customer?: BackendCustomer;
  paymentMethod?: BackendPaymentMethod | null;
  price?: Price & { plan?: Plan };
}

export const subscribersApi = {
  listCustomers: (projectId: string) =>
    http.get<BackendCustomer[]>(`/dashboard/projects/${projectId}/customers`),
  listSubscriptions: (projectId: string) =>
    http.get<BackendSubscription[]>(`/dashboard/projects/${projectId}/subscriptions`),
};

export type LedgerType = "charge" | "proration" | "refund" | "failed";
export interface LedgerEntry { id: string; date: string; type: LedgerType; note?: string; amount: number; }

const mockLedger: LedgerEntry[] = [
  { id: "inv_9F2", date: "14 Jun 2026", type: "charge", amount: 1500000 },
  { id: "inv_8A1", date: "02 Apr 2026", type: "proration", note: "upgrade", amount: 1286000 },
  { id: "ref_3C7", date: "28 Mar 2026", type: "refund", amount: -500000 },
  { id: "inv_7B0", date: "14 Mar 2026", type: "charge", amount: 1500000 },
];

export const ledgerApi = {
  // TODO: GET /dashboard/projects/:projectId/invoices
  async list(): Promise<LedgerEntry[]> { await delay(); return [...mockLedger]; },
  // TODO: POST /dashboard/projects/:projectId/invoices/:id/refund
  async refund(amount: number): Promise<LedgerEntry> {
    await delay();
    const entry: LedgerEntry = {
      id: `ref_${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      type: "refund", amount: -Math.abs(amount),
    };
    mockLedger.unshift(entry);
    return entry;
  },
};

export type WebhookStatus = "200" | "retry" | "failed";
export interface WebhookEvent { id: string; event: string; status: WebhookStatus; when: string; }

export const devApi = {
  // TODO: GET /dashboard/projects/:projectId/webhooks/events
  async events(): Promise<WebhookEvent[]> {
    await delay();
    return [
      { id: "evt_1", event: "subscription.active", status: "200", when: "2s ago" },
      { id: "evt_2", event: "invoice.paid", status: "200", when: "1m ago" },
      { id: "evt_3", event: "invoice.payment_failed", status: "retry", when: "5m ago" },
      { id: "evt_4", event: "subscription.canceled", status: "200", when: "1h ago" },
    ];
  },
};

export interface BankDetails { bankName: string; accountNumber: string; accountName: string; subAccount?: string; }
let mockBank: BankDetails | null = null;

export const payoutsApi = {
  // TODO: GET/POST /dashboard/projects/:projectId/payouts
  async get(): Promise<BankDetails | null> { await delay(); return mockBank; },
  async save(input: Omit<BankDetails, "subAccount">): Promise<BankDetails> {
    await delay(600);
    mockBank = { ...input, subAccount: `sub_acct_${Math.random().toString(36).slice(2, 8)}` };
    return mockBank;
  },
  async resolveAccount(_bankName: string, accountNumber: string): Promise<string> {
    await delay(500);
    if (accountNumber.length !== 10) throw new Error("Account number must be 10 digits.");
    const stub = ["Paya Technologies Ltd", "Craftly Africa Ltd", "Shiplane NG Ltd"];
    return stub[accountNumber.charCodeAt(0) % stub.length];
  },
};

// =====================================================================
// view helpers
// =====================================================================

// amounts are kobo on the wire; ₦1 = 100 kobo
export function koboToNaira(kobo: number) { return kobo / 100; }
export function nairaToKobo(naira: number) { return Math.round(naira * 100); }

export function formatNaira(kobo: number) {
  const sign = kobo < 0 ? "-" : "";
  return `${sign}₦${Math.abs(kobo / 100).toLocaleString("en-NG")}`;
}

export function priceLabel(price?: Price): string {
  if (!price) return "—";
  const n = price.billing_interval_count;
  const unit = price.billing_interval;
  if (n === 1) return `/ ${unit}`;
  return `/ ${n} ${unit}s`;
}

export const STATE_META: Record<SubscriptionState, { label: string; tone: "green" | "amber" | "red" | "gray" | "blue" }> = {
  incomplete: { label: "Incomplete", tone: "blue" },
  trialing: { label: "Trialing", tone: "blue" },
  active: { label: "Active", tone: "green" },
  past_due: { label: "Past due", tone: "amber" },
  canceled: { label: "Cancelled", tone: "gray" },
  unpaid: { label: "Unpaid", tone: "red" },
};

export const LEDGER_META: Record<LedgerType, { label: string; tone: "green" | "blue" | "violet" | "red" }> = {
  charge: { label: "charge", tone: "green" },
  proration: { label: "proration", tone: "blue" },
  refund: { label: "refund", tone: "violet" },
  failed: { label: "failed", tone: "red" },
};
