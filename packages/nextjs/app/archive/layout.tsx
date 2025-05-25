import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Archive Creation",
  description: "New container for collective memories",
});

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
