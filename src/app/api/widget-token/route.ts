import { authkit } from "@workos-inc/authkit-nextjs";
import { WorkOS } from "@workos-inc/node";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const POST = async (request: NextRequest) => {
  const { session } = await authkit(request);

  if (!session.user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 },
    );
  }

  if (!session.organizationId) {
    return NextResponse.json(
      { error: "An active organization is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.WORKOS_API_KEY;

  if (!apiKey) {
    console.error("WORKOS_API_KEY is not configured.");
    return NextResponse.json(
      { error: "The widget service is not configured." },
      { status: 500 },
    );
  }

  try {
    const workos = new WorkOS(apiKey);
    const token = await workos.widgets.getToken({
      userId: session.user.id,
      organizationId: session.organizationId,
      scopes: ["widgets:users-table:manage"],
    });

    return NextResponse.json(
      { token },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Unable to generate widget token:", error);
    return NextResponse.json(
      { error: "Unable to authorize the user-management widget." },
      { status: 500 },
    );
  }
};
