import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

const NONCE_COOKIE = "admin_google_nonce";
const NONCE_EXPIRY_SECONDS = 5 * 60;

export async function GET(request: NextRequest) {
    try {
        const nonce = randomBytes(32).toString("hex");

        const response = NextResponse.json(
            {
                success: true,
                nonce,
            },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );

        response.cookies.set(NONCE_COOKIE, nonce, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/admin/google",
            maxAge: NONCE_EXPIRY_SECONDS,
        });

        return response;
    } catch (error) {
        console.error("Google nonce generation error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to initialize Google authentication.",
            },
            { status: 500 }
        );
    }
}