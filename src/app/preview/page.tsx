import { PreviewClient } from "@/components/preview-client";
import { getSiteSettings } from "@/lib/settings";

type PreviewPageProps = {
  searchParams: Promise<{ cvId?: string }>;
};

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const params = await searchParams;
  const settings = await getSiteSettings();
  return <PreviewClient cvId={params.cvId || ""} paymentAmount={settings?.payment.paymentAmount || 500} paymentCurrency={settings?.payment.currency || "XAF"} />;
}
