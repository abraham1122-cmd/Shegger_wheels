
const USERS_KEY = "rental-users";
const SESSION_KEY = "demo_session";

const VALID_ROLES = ["renter", "owner", "admin"];


export function createInitialAccounts() {
  if (typeof window === "undefined") return;

  const users = getUsers();

  const accounts = [
    {
      id: "renter-001",
      name: "Renter",
      email: "user@gmail.com",
      password: "user1",
      role: "renter",
    },
    {
      id: "owner-001",
      name: "Owner",
      email: "owner@gmail.com",
      password: "owner1",
      role: "owner",
    },
    {
      id: "admin-001",
      name: "Admin",
      email: "admin@gmail.com",
      password: "admin1",
      role: "admin",
    },
  ];

  const updatedUsers = [...users];

  for (const account of accounts) {
    const exists = updatedUsers.some(
      (user) =>
        user.email?.trim().toLowerCase() ===
        account.email.toLowerCase()
    );

    if (!exists) {
      updatedUsers.push(account);
    }
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
}

// Get all saved users.
export function getUsers() {
  if (typeof window === "undefined") return [];

  try {
    const users = JSON.parse(
      localStorage.getItem(USERS_KEY) || "[]"
    );

    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

// Register a new renter.
export function registerUser(user) {
  if (typeof window === "undefined") {
    return {
      success: false,
      message: "Browser storage unavailable.",
    };
  }

  const name = user.name?.trim();
  const email = user.email?.trim().toLowerCase();
  const password = user.password;

  if (!name || !email || !password) {
    return {
      success: false,
      message: "Name, email, and password are required.",
    };
  }

  const users = getUsers();

  if (
    users.some(
      (item) => item.email?.toLowerCase() === email
    )
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
    role: "renter",
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

// Create owner/admin accounts for development and testing.
export function createDemoAccount({ name, email, password, role }) {
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

  if (!name?.trim() || !email?.trim() || !password) {
    return {
      success: false,
      message: "Name, email, and password are required.",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = getUsers();

  if (
    users.some(
      (item) => item.email?.toLowerCase() === normalizedEmail
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

// Sign in using saved email and password.
export function loginUser(email, password) {
  if (typeof window === "undefined") {
    return {
      success: false,
      message: "Browser storage unavailable.",
    };
  }

  const normalizedEmail = email?.trim().toLowerCase();

  const user = getUsers().find(
    (item) =>
      item.email?.toLowerCase() === normalizedEmail &&
      item.password === password &&
      VALID_ROLES.includes(item.role)
  );

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  createSession(user);

  return {
    success: true,
    role: user.role,
  };
}

// Save the currently signed-in user's session.
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

// Get the current session.
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

// Sign out.
export function clearSession() {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(SESSION_KEY);
}
