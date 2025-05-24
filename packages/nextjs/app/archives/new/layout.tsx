import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Archives",
  description: "All grouped memories created by the community",
});

const ArchivesLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ArchivesLayout;
