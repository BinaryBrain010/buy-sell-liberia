import { type NextRequest, NextResponse } from "next/server";
import { AuthService } from "../../modules/auth/services/auth.service";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const authService = new AuthService();

export async function POST(request: NextRequest) {
  try {
    console.log("[LOGIN ROUTE] Processing login request");

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      console.log("[LOGIN ROUTE] Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await authService.login(email, password);

    // Set HTTP-only cookies for tokens
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      { status: 200 }
    );

    response.cookies.set("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 1 day
    });

    response.cookies.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    console.log("[LOGIN ROUTE] Login successful for:", email);
    return response;
  } catch (error: any) {
    console.error("[LOGIN ROUTE] Login error:", error.message);

    // Check if it's a ban-related error
    if (error.message && error.message.includes("banned")) {
      return NextResponse.json(
        {
          error: error.message,
          isBanned: true,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 400 }
    );
  }
}
