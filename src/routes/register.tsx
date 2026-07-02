import { useState } from "react";
import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { AuthShell } from "../components/AuthShell";
import { Button, Field, TextInput } from "../components/ui";
import { authApi } from "../lib/api";
import { authStore } from "../lib/auth";
import { ApiError } from "../lib/http";
import { useToast } from "../components/Toast";

export const Route = createFileRoute("/register")({
  beforeLoad: async () => {
    const snap = authStore.getSnapshot();
    if (snap.status === "loading") {
      await authStore.refresh();
    }
    if (authStore.getSnapshot().status === "authed") {
      throw redirect({ to: "/app" });
    }
  },
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function submit() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Your name is required.";
    if (!email.trim()) next.email = "Work email is required.";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email))
      next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Use at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    try {
      await authApi.register({ name: name.trim(), email: email.trim(), password });
      navigate({ to: "/login", search: { registered: true } });
    } catch (err) {
      toast(
        err instanceof ApiError
          ? err.message
          : "Could not create your account. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Spin up a tenant and start defining plans in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-yellow-deep">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Your name" error={errors.name}>
          <TextInput
            placeholder="Enter full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Work email" error={errors.email}>
          <TextInput
            type="email"
            placeholder="Enter corporate email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field
          label="Password"
          error={errors.password}
          hint="At least 6 characters, mixing letters, numbers and a symbol."
        >
          <TextInput
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>
        <Button variant="dark" block disabled={pending} onClick={submit}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </div>
    </AuthShell>
  );
}