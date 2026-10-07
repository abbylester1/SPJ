import { cookies } from "next/headers";

const COOKIE_NAME = "smj_admin";

export async function isAdmin() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === "ok";
}

export async function setAdminCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "ok", { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
