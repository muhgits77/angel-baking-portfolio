import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect route — lives only to support old links. The real studio is at /admin with a simple passcode.
export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Studio — Angel's Artisan Kitchen" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: () => {
    throw redirect({ to: "/admin", replace: true });
  },
});
