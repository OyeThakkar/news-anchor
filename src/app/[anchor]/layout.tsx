import { notFound } from "next/navigation";
import { anchorIds, isAnchorId } from "@/lib/anchors";

export function generateStaticParams() {
  return anchorIds.map((anchor) => ({ anchor }));
}

export default async function AnchorLayout({ children, params }: LayoutProps<"/[anchor]">) {
  const { anchor } = await params;
  if (!isAnchorId(anchor)) notFound();
  return children;
}
