import { ProgressView } from "@/components/ProgressView";

export const metadata = {
  title: "Your progress · 1Claw Academy",
  description:
    "Track completion, quiz accuracy, and hands-on labs across the 1Claw Academy curriculum.",
  // Same shell for every visitor until client-side state (progress) loads —
  // nothing here for an anonymous crawler to index.
  robots: { index: false },
};

export default function ProgressPage() {
  return <ProgressView />;
}
