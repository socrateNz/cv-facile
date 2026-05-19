import puppeteer from "puppeteer";
import type { CVDocument } from "@/types/cv";

function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Génère un PDF A4 à partir de la page d'impression (même rendu que l'aperçu builder).
 */
export async function generateCvPdfBuffer(
  cv: CVDocument,
  options?: { cvId?: string; authToken?: string },
) {
  const cvId = options?.cvId || cv._id;
  if (cvId && options?.authToken !== undefined) {
    return generateCvPdfFromPrintPage(String(cvId), options.authToken);
  }

  // Fallback HTML simple si pas d'id (ne devrait pas arriver en prod)
  return generateCvPdfFromHtml(cv);
}

async function generateCvPdfFromPrintPage(cvId: string, authToken: string) {
  const baseUrl = getAppBaseUrl();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const url = new URL("/cv/print", baseUrl);
    url.searchParams.set("cvId", cvId);

    const { hostname } = url;
    await page.setCookie({
      name: "cvfacile_token",
      value: authToken,
      domain: hostname === "localhost" ? "localhost" : hostname,
      path: "/",
      httpOnly: true,
    });

    await page.goto(url.toString(), {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    await page.waitForSelector('[data-pdf-ready="true"]', { timeout: 30000 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

/** Fallback minimal (ancien comportement) */
async function generateCvPdfFromHtml(cv: CVDocument) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(renderCvHtml(cv), { waitUntil: "networkidle0" });
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
  });
  await browser.close();
  return pdf;
}

function renderCvHtml(cv: CVDocument) {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
          h1 { margin-bottom: 4px; }
          h2 { margin-top: 24px; color: #2563EB; border-bottom: 1px solid #DBEAFE; padding-bottom: 4px; }
          p { line-height: 1.5; }
          .muted { color: #6B7280; }
          ul { padding-left: 16px; }
        </style>
      </head>
      <body>
        <h1>${cv.fullName}</h1>
        <p class="muted">${cv.email || ""}</p>
        <p class="muted">${cv.title}</p>
        <p>${cv.summary || ""}</p>
        <h2>Expériences</h2>
        ${cv.experiences
          .map(
            (exp) => `
              <p><strong>${exp.role}</strong> - ${exp.company}</p>
              <p class="muted">${exp.startDate} - ${exp.endDate}</p>
              <p>${exp.summary}</p>
            `,
          )
          .join("")}
        <h2>Éducation</h2>
        ${cv.education
          .map(
            (edu) => `
              <p><strong>${edu.degree}</strong> - ${edu.school}</p>
              <p class="muted">${edu.startDate} - ${edu.endDate}</p>
            `,
          )
          .join("")}
        <h2>Compétences</h2>
        <ul>${cv.skills.map((skill) => `<li>${skill}</li>`).join("")}</ul>
      </body>
    </html>
  `;
}
