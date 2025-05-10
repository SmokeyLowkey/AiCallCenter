import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/auth/login" ||
    path === "/auth/register" ||
    path.startsWith("/auth/verify") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/_next/") ||  // Next.js internal routes
    path.includes(".") ||  // Files with extensions (like .jpg, .png, etc.)
    path.startsWith("/favicon.ico");
    
  // Check if it's an API route
  const isApiRoute = path.startsWith("/api/");

  // Check for the session token in cookies
  const authCookie = request.cookies.get("next-auth.session-token")?.value ||
                     request.cookies.get("__Secure-next-auth.session-token")?.value;
                     
  // Log the auth cookie for debugging
  console.log("Auth cookie in middleware:", !!authCookie);

  // For API routes, return a 401 response instead of redirecting
  if (isApiRoute && !isPublicPath && !authCookie) {
    return new NextResponse(
      JSON.stringify({ error: "Authentication required" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  
  // Redirect to login if trying to access a protected route without being authenticated
  if (!isPublicPath && !authCookie && !isApiRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect to dashboard if already authenticated and trying to access auth pages
  if (authCookie && (path === "/auth/login" || path === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Only apply middleware to these paths
    "/dashboard/:path*",
    "/api/:path*",
    "/auth/:path*",
  ],
};