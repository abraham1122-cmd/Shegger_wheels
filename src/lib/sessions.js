
const USERS_KEY = "rental-users";
const SESSION_KEY = "demo_session";

const VALID_ROLES = ["renter", "owner", "admin"];

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

// Initialize demo account profiles from the server.
export async function createInitialAccounts() {
  if (typeof window === "undefined") return;

  try {
    const response = await fetch("/api/auth/login", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) return;

    const result = await response.json();

    if (!result.success || !Array.isArray(result.accounts)) {
      return;
    }

    const users = getUsers();
    const updatedUsers = [...users];

    for (const account of result.accounts) {
      const accountEmail = normalizeEmail(account?.email);

      if (!accountEmail || !account.id || !VALID_ROLES.includes(account.role)) {
        continue;
      }

      const exists = updatedUsers.some(
        (user) => normalizeEmail(user?.email) === accountEmail
      );

      if (!exists) {
        updatedUsers.push({
          ...account,
          email: accountEmail,
        });
      }
    }

    const cleanedUsers = updatedUsers
      .filter((user) => user && typeof user === "object")
      .map((user) => ({
        ...user,
        lastLoginAt: user.lastLoginAt || user.isLastLoginAt || null,
      }));

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(cleanedUsers)
    );
  } catch (error) {
    console.error("Unable to initialize demo accounts:", error);
  }
}

export function getUsers() {
  if (typeof window === "undefined") return [];

  try {
    const users = JSON.parse(
      localStorage.getItem(USERS_KEY) || "[]"
    );

    return Array.isArray(users)
      ? users.filter((user) => user && typeof user === "object")
      : [];
  } catch {
    return [];
  }
}

export function registerUser(user) {
  if (typeof window === "undefined") {
    return {
      success: false,
      message: "Browser storage unavailable.",
    };
  }

  const name = user?.name?.trim();
  const email = normalizeEmail(user?.email);
  const password = user?.password;
  const role = user?.role;

  if (!name || !email || !password) {
    return {
      success: false,
      message: "Name, email, and password are required.",
    };
  }

  if (!["renter", "owner"].includes(role)) {
    return {
      success: false,
      message: "Please select a valid account role.",
    };
  }

  const users = getUsers();

  if (
    users.some((item) => normalizeEmail(item.email) === email)
  ) {
    return {
      success: false,
      message: "This email is already registered.",
    };
  }

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    role,
    status: "active",
    isActive: true,
    lastLoginAt: new Date().toISOString(),
  };

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify([...users, newUser])
  );

  createSession(newUser);

  return {
    success: true,
    role: newUser.role,
  };
}

export function createDemoAccount({
  name,
  email,
  password,
  role,
}) {
  if (typeof window === "undefined") {
    return {
      success: false,
      message: "Browser storage unavailable.",
    };
  }

  if (!["owner", "admin"].includes(role)) {
    return {
      success: false,
      message: "Role must be owner or admin.",
    };
  }

  const normalizedEmail = normalizeEmail(email);

  if (!name?.trim() || !normalizedEmail || !password) {
    return {
      success: false,
      message: "Name, email, and password are required.",
    };
  }

  const users = getUsers();

  if (
    users.some(
      (item) => normalizeEmail(item.email) === normalizedEmail
    )
  ) {
    return {
      success: false,
      message: "This email is already registered.",
    };
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
    status: "active",
    isActive: true,
    lastLoginAt: null,
  };

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify([...users, newUser])
  );

  return {
    success: true,
    role: newUser.role,
  };
}

// Login registered users locally or verify demo users on the server.
export async function loginUser(email, password) {
  if (typeof window === "undefined") {
    return {
      success: false,
      message: "Browser storage unavailable.",
    };
  }

  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return {
      success: false,
      message: "Email and password are required.",
    };
  }

  const users = getUsers();

  // Check locally registered users.
  const userIndex = users.findIndex(
    (user) =>
      normalizeEmail(user.email) === normalizedEmail &&
      user.password === password &&
      VALID_ROLES.includes(user.role)
  );

  if (userIndex !== -1) {
    const updatedUser = {
      ...users[userIndex],
      lastLoginAt: new Date().toISOString(),
    };

    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(updatedUsers)
    );

    createSession(updatedUser);

    return {
      success: true,
      role: updatedUser.role,
    };
  }

  // Verify demo accounts on the server.
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
      }),
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success || !result.user) {
      return {
        success: false,
        message: result.message || "Invalid email or password.",
      };
    }

    const demoUser = {
      ...result.user,
      isActive: true,
      lastLoginAt: new Date().toISOString(),
    };

    if (
      !demoUser.id ||
      !VALID_ROLES.includes(demoUser.role) ||
      !normalizeEmail(demoUser.email)
    ) {
      return {
        success: false,
        message: "The server returned an invalid account.",
      };
    }

    const currentUsers = getUsers();

    const existingIndex = currentUsers.findIndex(
      (user) => user.id === demoUser.id
    );

    if (existingIndex !== -1) {
      currentUsers[existingIndex] = {
        ...currentUsers[existingIndex],
        ...demoUser,
      };
    } else {
      currentUsers.push(demoUser);
    }

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(currentUsers)
    );

    createSession(demoUser);

    return {
      success: true,
      role: demoUser.role,
    };
  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      message: "Unable to connect to the server.",
    };
  }
}

export function createSession(user) {
  if (typeof window === "undefined") return null;

  if (!user?.id || !VALID_ROLES.includes(user.role)) {
    throw new Error("Invalid user account.");
  }

  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return session;
}

export function getSession() {
  if (typeof window === "undefined") return null;

  try {
    const savedSession = sessionStorage.getItem(SESSION_KEY);

    if (!savedSession) return null;

    const session = JSON.parse(savedSession);

    if (
      !session?.id ||
      !VALID_ROLES.includes(session.role)
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function isSignedIn() {
  return getSession() !== null;
}

export function hasRole(role) {
  return getSession()?.role === role;
}

export function clearSession() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(SESSION_KEY);
}
