"use server";

import { setAdminCookie } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login?error=1");
  }
  await setAdminCookie();
  redirect("/admin");
}
