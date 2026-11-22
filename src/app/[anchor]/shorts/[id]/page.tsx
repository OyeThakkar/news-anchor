import { MediaPage } from "@/components/media-page";

export default function ShortPage({ params }: PageProps<"/[anchor]/shorts/[id]">) {
  return <MediaPage kind="shorts" params={params} />;
}
