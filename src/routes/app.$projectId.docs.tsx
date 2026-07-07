import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/$projectId/docs")({
  beforeLoad: () => {
    throw redirect({ to: "/docs" });
  },
});
