import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Card, Badge, Button } from "../components/ui";

export const Route = createFileRoute("/docs")({
  component: PublicApiDocsPage,
});

interface Endpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  summary: string;
  description: string;
  tag: string;
  headers?: { name: string; type: string; required: boolean; desc: string }[];
  params?: { name: string; type: string; required: boolean; desc: string }[];
  requestBody?: string;
  responseBody?: string;
}

const SPEC: Endpoint[] = [
  {
    tag: "Subscriptions",
    method: "POST",
    path: "/v1/subscriptions",
    summary: "Initialize Subscription",
    description: "Creates a new customer record and generates an incomplete subscription linked to a pricing plan. Returns a checkout URL to authorize the customer's card.",
    headers: [
      { name: "Authorization", type: "string", required: true, desc: "Bearer <your_secret_api_key>" },
    ],
    requestBody: `{
  "customer": {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "meta": {
      "customerId": "cust_9872"
    }
  },
  "priceId": "price_cmr3j...",
  "redirectUrl": "https://yourdomain.com/success"
}`,
    responseBody: `{
  "success": true,
  "statusCode": 201,
  "data": {
    "subscriptionId": "sub_8xY2b...",
    "checkoutUrl": "https://checkout.nomba.com/..."
  }
}`,
  },
  {
    tag: "Subscriptions",
    method: "GET",
    path: "/v1/subscriptions/:id",
    summary: "Retrieve Subscription",
    description: "Retrieves the active state and attributes of a specific subscription from the database, including pricing and metadata.",
    headers: [
      { name: "Authorization", type: "string", required: true, desc: "Bearer <your_secret_api_key>" },
    ],
    params: [
      { name: "id", type: "string", required: true, desc: "The unique subscription ID" },
    ],
    responseBody: `{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "sub_8xY2b...",
    "status": "active",
    "current_period_start": "2026-07-07T10:00:00.000Z",
    "current_period_end": "2026-08-07T10:00:00.000Z",
    "customer": {
      "name": "Jane Doe",
      "email": "jane.doe@example.com"
    }
  }
}`,
  },
  {
    tag: "Customer Portal",
    method: "POST",
    path: "/v1/portal/sessions",
    summary: "Create Portal Session",
    description: "Generates a secure, tokenized JWT billing session key programmatically for downstream customer self-service portals.",
    headers: [
      { name: "Authorization", type: "string", required: true, desc: "Bearer <your_secret_api_key>" },
    ],
    requestBody: `{
  "subscriptionId": "sub_8xY2b..."
}`,
    responseBody: `{
  "success": true,
  "statusCode": 201,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}`,
  },
  {
    tag: "Customer Portal",
    method: "GET",
    path: "/v1/portal/session",
    summary: "Load Portal Session",
    description: "Decodes the JWT token transmitted in headers to load matching subscriber records securely.",
    headers: [
      { name: "Authorization", type: "string", required: true, desc: "Bearer <JWT_Portal_Token>" },
    ],
    responseBody: `{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "sub_8xY2b...",
    "status": "active",
    "customer": { "name": "Jane Doe" },
    "price": { "unit_amount": 1500000 }
  }
}`,
  },
  {
    tag: "Customer Portal",
    method: "POST",
    path: "/v1/portal/subscription/change-plan",
    summary: "Change Subscription Plan",
    description: "Upgrades or downgrades subscription pricing tier using card tokens, capturing proration invoices instantly.",
    headers: [
      { name: "Authorization", type: "string", required: true, desc: "Bearer <JWT_Portal_Token>" },
    ],
    requestBody: `{
  "planId": "plan_7aX8"
}`,
    responseBody: `{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "sub_8xY2b...",
    "status": "active",
    "price_id": "price_new..."
  }
}`,
  },
  {
    tag: "Customer Portal",
    method: "POST",
    path: "/v1/portal/subscription/cancel",
    summary: "Cancel Subscription",
    description: "Cancels the subscription immediately and fires a subscription.canceled webhook event.",
    headers: [
      { name: "Authorization", type: "string", required: true, desc: "Bearer <JWT_Portal_Token>" },
    ],
    responseBody: `{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "sub_8xY2b...",
    "status": "canceled",
    "canceled_at": "2026-07-07T11:00:00.000Z"
  }
}`,
  },
];

type Lang = "curl" | "js" | "node";

function PublicApiDocsPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lang, setLang] = useState<Lang>("curl");
  const [apiKey, setApiKey] = useState("sk_test_••••••••");

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const active = SPEC[activeIdx];

  const generateSnippet = (e: Endpoint, l: Lang) => {
    const bearer = e.path.includes("/portal/") ? "PORTAL_JWT_TOKEN" : apiKey;
    const bodyStr = e.requestBody ? `\n  -d '${e.requestBody}'` : "";
    const fetchBodyStr = e.requestBody ? `,\n  body: JSON.stringify(${e.requestBody.replace(/\n/g, "\n  ")})` : "";
    const axiosBodyStr = e.requestBody ? `,\n  ${e.requestBody.replace(/\n/g, "\n  ")}` : "";

    if (l === "curl") {
      return `curl -X ${e.method} "${apiUrl}${e.path}" \\
  -H "Authorization: Bearer ${bearer}" \\
  -H "Content-Type: application/json"${bodyStr}`;
    }
    if (l === "js") {
      return `fetch("${apiUrl}${e.path}", {
  method: "${e.method}",
  headers: {
    "Authorization": "Bearer ${bearer}",
    "Content-Type": "application/json"
  }${fetchBodyStr}
})
  .then(res => res.json())
  .then(console.log);`;
    }
    return `import axios from 'axios';

axios({
  method: "${e.method.toLowerCase()}",
  url: "${apiUrl}${e.path}",
  headers: {
    "Authorization": "Bearer ${bearer}",
    "Content-Type": "application/json"
  }${axiosBodyStr}
})
  .then(res => console.log(res.data));`;
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-line-2 bg-surface px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid h-[28px] w-[28px] place-items-center rounded-full bg-violet-bg text-[12.5px] font-bold text-violet">
            OB
          </span>
          <span className="text-[15px] font-bold text-ink tracking-tight">Orbit API Reference</span>
          <span className="text-[10px] font-semibold text-ink-3 border border-line bg-surface-3 px-1.5 py-0.5 rounded-[4px]">v1.0</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/app"
            className="text-[12.5px] font-semibold text-ink-2 hover:text-ink transition-colors px-3.5 py-1.5 rounded-[8px] border border-line hover:bg-surface-3"
          >
            Go to Dashboard
          </a>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="w-full max-w-7xl mx-auto px-6 py-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-ink">API Reference</h1>
            <p className="text-[13px] text-ink-3 mt-1.5">
              Explore available API resources and test request structures in real-time.
            </p>
          </div>
          {/* Key Injector */}
          <div className="flex items-center gap-2 bg-surface border border-line rounded-[10px] px-3.5 py-2 shadow-sm max-w-xs w-full">
            <span className="text-[11.5px] font-semibold text-ink-3 whitespace-nowrap">API Key:</span>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste sk_test_..."
              className="text-[12.5px] font-mono text-ink bg-transparent focus:outline-none w-full"
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Sidebar Nav */}
          <div className="space-y-4">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-ink-4 select-none px-2.5">
                Endpoints
              </span>
              <div className="mt-3 space-y-1">
                {SPEC.map((e, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`w-full text-left px-2.5 py-2 rounded-[7px] text-[13px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      activeIdx === idx
                        ? "bg-cream text-yellow-ink font-semibold"
                        : "text-ink-2 hover:bg-surface-3 hover:text-ink"
                    }`}
                  >
                    <span className="truncate">{e.summary}</span>
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded-[4px] border ${
                        e.method === "POST"
                          ? "text-blue border-blue/20 bg-blue-bg"
                          : "text-green border-green/20 bg-cream"
                      }`}
                    >
                      {e.method}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Code Playground Split */}
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] items-start">
            {/* Left Docs Column */}
            <Card className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone={active.method === "POST" ? "info" : "success"}>
                    {active.method}
                  </Badge>
                  <code className="text-[13px] font-bold text-ink bg-surface-3 px-2.5 py-1 rounded-[6px]">
                    {active.path}
                  </code>
                </div>
                <h2 className="text-[18px] font-bold text-ink mt-4">{active.summary}</h2>
                <p className="text-[13px] leading-relaxed text-ink-3 mt-2">
                  {active.description}
                </p>
              </div>

              {/* Headers */}
              {active.headers && (
                <div>
                  <h3 className="text-[11.5px] font-bold uppercase text-ink-3 tracking-wider mb-2 border-b border-line pb-1">
                    Request Headers
                  </h3>
                  <div className="divide-y divide-line-2">
                    {active.headers.map((h) => (
                      <div key={h.name} className="py-2.5 flex justify-between items-start text-[12.5px]">
                        <div>
                          <span className="font-semibold text-ink">{h.name}</span>
                          {h.required && <span className="text-[10px] text-red ml-1 font-bold">required</span>}
                          <p className="text-[12px] text-ink-4 mt-0.5">{h.desc}</p>
                        </div>
                        <span className="text-[11.5px] text-ink-3 bg-surface-2 px-2 py-0.5 rounded-[4px] border border-line">
                          {h.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Path Params */}
              {active.params && (
                <div>
                  <h3 className="text-[11.5px] font-bold uppercase text-ink-3 tracking-wider mb-2 border-b border-line pb-1">
                    Path Parameters
                  </h3>
                  <div className="divide-y divide-line-2">
                    {active.params.map((p) => (
                      <div key={p.name} className="py-2.5 flex justify-between items-start text-[12.5px]">
                        <div>
                          <span className="font-semibold text-ink">{p.name}</span>
                          {p.required && <span className="text-[10px] text-red ml-1 font-bold">required</span>}
                          <p className="text-[12px] text-ink-4 mt-0.5">{p.desc}</p>
                        </div>
                        <span className="text-[11.5px] text-ink-3 bg-surface-2 px-2 py-0.5 rounded-[4px] border border-line">
                          {p.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Body Info */}
              {active.requestBody && (
                <div>
                  <h3 className="text-[11.5px] font-bold uppercase text-ink-3 tracking-wider mb-2 border-b border-line pb-1">
                    Payload Schema
                  </h3>
                  <div className="bg-surface-2 border border-line rounded-[8px] p-3.5 overflow-x-auto">
                    <pre className="text-[11.5px] text-ink-2 font-mono leading-relaxed">
                      {active.requestBody}
                    </pre>
                  </div>
                </div>
              )}
            </Card>

            {/* Right Code Column */}
            <div className="space-y-6">
              <Card className="overflow-hidden border border-line-2">
                <div className="bg-ink text-white px-4 py-2.5 flex items-center justify-between border-b border-white/10 select-none">
                  <span className="text-[11px] font-bold tracking-wide uppercase text-white/55">
                    Request Example
                  </span>
                  <div className="flex bg-white/10 rounded-[6px] p-0.5 text-[11.5px] font-medium">
                    {(["curl", "js", "node"] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={`px-2.5 py-0.5 rounded-[4px] cursor-pointer transition-colors ${
                          lang === l
                            ? "bg-white text-ink font-bold shadow-sm"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {l === "curl" ? "cURL" : l === "js" ? "Fetch" : "Axios"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-ink p-4.5 overflow-x-auto min-h-[180px]">
                  <pre className="text-[11.5px] text-yellow/95 font-mono leading-relaxed whitespace-pre select-all">
                    {generateSnippet(active, lang)}
                  </pre>
                </div>
              </Card>

              {active.responseBody && (
                <Card className="overflow-hidden border border-line-2">
                  <div className="bg-ink text-white px-4 py-2.5 flex items-center justify-between border-b border-white/10 select-none">
                    <span className="text-[11px] font-bold tracking-wide uppercase text-white/55">
                      Response Output (200 Success)
                    </span>
                  </div>
                  <div className="bg-ink p-4.5 overflow-x-auto">
                    <pre className="text-[11.5px] text-green/95 font-mono leading-relaxed whitespace-pre select-all">
                      {active.responseBody}
                    </pre>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
