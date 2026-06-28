import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AuthShell } from "../components/AuthShell";
import { Button, Field, TextInput } from "../components/ui";
import { authApi } from "../lib/api";
import { ApiError } from "../lib/http";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit() {
    setServerError(null);
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
      // account created — send them to sign in
      navigate({ to: "/login", search: { registered: true } });
    } catch (err) {
      setServerError(
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
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Work email" error={errors.email}>
          <TextInput
            type="email"
            placeholder="you@company.com"
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>
        {serverError && (
          <p className="rounded-[10px] bg-red-bg px-3.5 py-2.5 text-[12px] font-medium text-red">
            {serverError}
          </p>
        )}
        <Button variant="dark" block disabled={pending} onClick={submit}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </div>
    </AuthShell>
  );
}