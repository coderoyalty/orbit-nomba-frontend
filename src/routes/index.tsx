import { createFileRoute, redirect } from "@tanstack/react-router";
import { authStore } from "../lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (authStore.getSnapshot().status === "loading") {
      await authStore.refresh();
    }
    throw redirect({
      to: authStore.getSnapshot().status === "authed" ? "/app" : "/login",
    });
  },
});
