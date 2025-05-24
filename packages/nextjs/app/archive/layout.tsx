import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Archive Details",
  description: "View detailed information about a specific archive",
});

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
