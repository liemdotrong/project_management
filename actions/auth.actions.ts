"use server";

import { cookies } from "next/headers";
import connectDB from "@/lib/mongo";
import User from "@/models/User";
import { redirect } from "next/navigation";
import crypto from "crypto";

function hashMD5(str: string) {
  return crypto.createHash('md5').update(str).digest('base64');
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  await connectDB();
  const user = await User.findOne({ email });
  const hashedPassword = hashMD5(password);

  if (!user || user.password !== hashedPassword) {
    redirect("/login?error=invalid");
  }

  // Create simple session (store user info in cookie)
  const sessionData = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar_url || null
  };

  const cookieStore = await cookies();
  cookieStore.set("pm_session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("pm_session");
  redirect("/login");
}


