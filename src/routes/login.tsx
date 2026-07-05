import { useState } from "react";
import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { AuthShell } from "../components/AuthShell";
import { Button, Field, TextInput } from "../components/ui";
import { authApi } from "../lib/api";
import { authStore } from "../lib/auth";
import { ApiError } from "../lib/http";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    registered: search.registered === true || search.registered === "true",
  }),
  beforeLoad: async () => {
    const snap = authStore.getSnapshot();
    if (snap.status === "loading") {
      await authStore.refresh();
    }
    if (authStore.getSnapshot().status === "authed") {
      throw redirect({ to: "/app" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { registered } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!email.trim() || !password) {
      toast("Enter your email and password to continue.");
      return;
    }
    setPending(true);
    try {
      await authApi.login({ email: email.trim(), password });
      await authStore.refresh();
      navigate({ to: "/app" });
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your tenant dashboard and API keys."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-semibold text-yellow-deep">
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {registered && (
          <p className="rounded-[10px] bg-green-bg px-3.5 py-2.5 text-[12px] font-medium text-green">
            Account created — sign in to continue.
          </p>
        )}
        <Field label="Work email">
          <TextInput
            type="email"
            placeholder="Enter corporate email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>
        <Field label="Password">
          <TextInput
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>
        <Button variant="dark" block disabled={pending} onClick={submit}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </AuthShell>
  );
}