import { createFileRoute } from "@tanstack/react-router";
import { SkyDefenders } from "@/components/SkyDefenders";

export const Route = createFileRoute("/")({
  component: SkyDefenders,
});
