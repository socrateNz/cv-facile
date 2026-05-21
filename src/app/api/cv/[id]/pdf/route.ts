import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CVModel } from "@/models/CV";
import { getSessionUser } from "@/lib/auth";
import { buildCvAccessFilter, getGuestId } from "@/lib/guest";
import { getValidPaymentForCv } from "@/lib/payment-access";
import { generateCvPdfBuffer } from "@/lib/pdf";
import type { CVDocument } from "@/types/cv";
import { normalizeTemplate } from "@/lib/utils";

type PdfCV = Pick<
  CVDocument,
  | "_id"
  | "userId"
  | "guestId"
  | "fullName"
  | "email"
  | "title"
  | "summary"
  | "experiences"
  | "education"
  | "skills"
  | "photoUrl"
  | "template"
  | "status"
> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectToDatabase();
  const { id } = await params;
  const session = getSessionUser(req);
  const guestId = getGuestId(req);

  const filter = buildCvAccessFilter(id, session, guestId);
  if (!filter) {
    return NextResponse.json({ message: "Accès refusé." }, { status: 403 });
  }

  const cv = await CVModel.findOne(filter).lean<PdfCV | null>();
  if (!cv) {
    return NextResponse.json({ message: "CV introuvable." }, { status: 404 });
  }

  if (session?.role !== "admin") {
    const payment = await getValidPaymentForCv(id);
    if (!payment) {
      return NextResponse.json(
        { message: "Paiement requis avant téléchargement (500 FCFA)." },
        { status: 402 },
      );
    }
  }

  const authToken = req.cookies.get("cvfacile_token")?.value || "";
  const cvGuestId = cv.guestId ? String(cv.guestId) : guestId || "";

  const pdfBuffer = await generateCvPdfBuffer(
    {
      _id: String(cv._id),
      userId: cv.userId ? String(cv.userId) : "",
      fullName: cv.fullName,
      email: cv.email,
      title: cv.title,
      summary: cv.summary,
      experiences: cv.experiences,
      education: cv.education,
      skills: cv.skills,
      photoUrl: cv.photoUrl,
      template: normalizeTemplate(cv.template),
      status: cv.status || "published",
      createdAt: cv.createdAt?.toISOString(),
      updatedAt: cv.updatedAt?.toISOString(),
    },
    { cvId: id, authToken, guestId: cvGuestId },
  );

  const safeName = (cv.fullName || "cv")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 40);

  return new NextResponse(Buffer.from(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=cvfacile-${safeName || id}.pdf`,
    },
  });
}
