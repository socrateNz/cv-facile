import { PreviewClient } from "@/components/preview-client";

type PreviewPageProps = {
  searchParams: Promise<{ cvId?: string }>;
};

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const params = await searchParams;
  return <PreviewClient cvId={params.cvId || ""} />;
}
