import { MediaPage } from "@/components/media-page";

export default function VideoPage({ params }: PageProps<"/[anchor]/videos/[id]">) {
  return <MediaPage kind="videos" params={params} />;
}
