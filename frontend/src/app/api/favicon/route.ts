import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    // Check if custom favicon exists
    for (const ext of ["png", "ico", "svg", "webp"]) {
      const fileName = `custom-favicon.${ext}`;
      const filePath = path.join(publicDir, fileName);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const mime =
          ext === "svg"
            ? "image/svg+xml"
            : ext === "ico"
            ? "image/x-icon"
            : ext === "webp"
            ? "image/webp"
            : "image/png";
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": mime,
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      }
    }

    // Fallback to default favicon.ico
    const defaultFavicon = path.join(publicDir, "favicon.ico");
    if (fs.existsSync(defaultFavicon)) {
      const fileBuffer = fs.readFileSync(defaultFavicon);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "image/x-icon",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    return new NextResponse(null, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { favicon } = body;
    const publicDir = path.join(process.cwd(), "public");

    // Clean up any existing custom-favicon.* files
    for (const ext of ["png", "ico", "svg", "webp"]) {
      const oldPath = path.join(publicDir, `custom-favicon.${ext}`);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch {
          // ignore
        }
      }
    }

    if (!favicon || !favicon.trim()) {
      return NextResponse.json({
        success: true,
        url: "/favicon.ico",
        message: "Favicon restablecido al predeterminado",
      });
    }

    // If it's a data URL, save it to disk in public/
    if (favicon.startsWith("data:")) {
      const matches = favicon.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const ext = mimeType.includes("svg")
          ? "svg"
          : mimeType.includes("icon") || mimeType.includes("ico")
          ? "ico"
          : mimeType.includes("webp")
          ? "webp"
          : "png";

        const fileName = `custom-favicon.${ext}`;
        const filePath = path.join(publicDir, fileName);
        const buffer = Buffer.from(base64Data, "base64");
        fs.writeFileSync(filePath, buffer);

        const publicUrl = `/${fileName}`;
        return NextResponse.json({
          success: true,
          url: publicUrl,
          message: "Favicon guardado exitosamente",
        });
      }
    }

    // If it's an external HTTP URL, return as is
    return NextResponse.json({
      success: true,
      url: favicon,
      message: "URL de favicon vinculada",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
