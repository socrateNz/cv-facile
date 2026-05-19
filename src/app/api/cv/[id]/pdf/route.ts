import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { CVModel } from "@/models/CV";
import { PaymentModel } from "@/models/Payment";
import { getSessionUser } from "@/lib/auth";
import { generateCvPdfBuffer } from "@/lib/pdf";
import type { CVDocument } from "@/types/cv";
import { normalizeTemplate } from "@/lib/utils";

type PdfCV = Pick<
  CVDocument,
  | "_id"
  | "userId"
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ message: "Authentification requise." }, { status: 401 });
  }
  const { userId, role } = session;

  const cvQuery = role === "admin" ? { _id: id } : { _id: id, userId };
  const cv = await CVModel.findOne(cvQuery).lean<PdfCV | null>();
  if (!cv) {
    return NextResponse.json({ message: "CV introuvable." }, { status: 404 });
  }

  if (role !== "admin") {
    const payment = await PaymentModel.findOne({
      userId,
      cvId: id,
      status: "completed",
      deletedAt: null,
    }).lean<{ expiresAt?: Date | string | null } | null>();

    if (!payment) {
      return NextResponse.json(
        { message: "Paiement requis avant téléchargement." },
        { status: 402 },
      );
    }

    if (payment.expiresAt && new Date() > new Date(payment.expiresAt)) {
      return NextResponse.json(
        {
          message:
            "Le lien de téléchargement a expiré. Votre accès était valide 30 jours après le paiement.",
        },
        { status: 410 },
      );
    }
  }

  const authToken = req.cookies.get("cvfacile_token")?.value || "";

  const pdfBuffer = await generateCvPdfBuffer(
    {
      _id: String(cv._id),
      userId: String(cv.userId),
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
    { cvId: id, authToken },
  );

  return new NextResponse(Buffer.from(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=cvfacile-${id}.pdf`,
    },
  });
}
