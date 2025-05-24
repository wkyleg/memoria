import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "All Archives",
  description: "Browse all archives in the Memoria network",
});

export default function ArchiveListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
