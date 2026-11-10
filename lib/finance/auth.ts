
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  getAuthenticatedAdmin,
} from "@/lib/auth/session";

export async function requireFinanceAdmin() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return {
      admin: null,
      response: Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const admin = await getAuthenticatedAdmin(token);

  if (!admin) {
    return {
      admin: null,
      response: Response.json(
        { success: false, message: "Session expired or invalid" },
        { status: 401 }
      ),
    };
  }

  return {
    admin,
    response: null,
  };
}
