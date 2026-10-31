


import { NextResponse } from "next/server";



function getDemoAccounts() {
  return [
    {
      id: "renter-001",
      name: "Renter",
      email: process.env.DEMO_RENTER_LOGIN_EMAIL,
      password: process.env.DEMO_RENTER_LOGIN_PASSWORD,
      role: "renter",
    },
    {
      id: "owner-001",
      name: "Owner",
      email: process.env.DEMO_OWNER_LOGIN_EMAIL,
      password: process.env.DEMO_OWNER_LOGIN_PASSWORD,
      role: "owner",
    },
    {
      id: "admin-001",
      name: "Admin",
      email: process.env.DEMO_ADMIN_LOGIN_EMAIL,
      password: process.env.DEMO_ADMIN_LOGIN_PASSWORD,
      role: "admin",
    },
  ];
}


export async function GET() {
  const accounts = getDemoAccounts()
    .filter((account) => account.email && account.password)
    .map(({ password, ...account }) => ({
      ...account,
      isActive: true,
      lastLoginAt: null,
    }));

  return NextResponse.json(
    { success: true, accounts },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}


export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const account = getDemoAccounts().find(
      (user) =>
        user.email &&
        user.password &&
        user.email.trim().toLowerCase() ===
          email.trim().toLowerCase() &&
        user.password === password
    );

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role,
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to process login.",
      },
      { status: 500 }
    );
  }
}
