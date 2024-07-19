import { SimpleEmailStateProvider } from "@/app/(app)/simple/SimpleProgressProvider";

export default async function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SimpleEmailStateProvider>{children}</SimpleEmailStateProvider>;
}
