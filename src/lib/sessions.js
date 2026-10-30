


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
      email: process.env.DEMO_RENTER_LOGIN_EMAIL,
      password: process.env.DEMO_RENTER_LOGIN_PASSWORD,
      role: "renter",
      isActive: true,
      lastLoginAt: new Date().toISOString(),
    },
    {
      id: "owner-001",
      name: "Owner",
      email: process.env.DEMO_OWNER_LOGIN_EMAIL,
      password: process.env.DEMO_OWNER_LOGIN_PASSWORD,
      role: "owner",
      isActive: true,
      lastLoginAt: new Date().toISOString(),
    },
    {
      id: "admin-001",
      name: "Admin",
      email: process.env.DEMO_ADMIN_LOGIN_EMAIL,
      password:process.env.DEMO_ADMIN_LOGIN_PASSWORD,
      role: "admin",
      isActive: true,
      lastLoginAt: null,
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

  for (const user of updatedUsers) {
    if (!user.lastLoginAt && user.isLastLoginAt) {
      user.lastLoginAt = user.isLastLoginAt;
    }
  }

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(updatedUsers)
  );
}


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
  const role = user.role;

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
    users.some(
      (item) => item.email?.trim().toLowerCase() === email
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
      (item) =>
        item.email?.trim().toLowerCase() === normalizedEmail
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


export function loginUser(email, password) {
  if (typeof window === "undefined") {
    return {
      success: false,
      message: "Browser storage unavailable.",
    };
  }

  const normalizedEmail = email?.trim().toLowerCase();
  const users = getUsers();

  const userIndex = users.findIndex(
    (user) =>
      user.email?.trim().toLowerCase() === normalizedEmail &&
      user.password === password &&
      VALID_ROLES.includes(user.role)
  );

  if (userIndex === -1) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

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

