import { PageTransition } from "@/components/shared/page-transition";

export default function RootTemplate({ children }) {
  return <PageTransition>{children}</PageTransition>;
}