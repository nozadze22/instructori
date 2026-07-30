import { redirect } from "next/navigation";

export default function AdminRegisterRedirectPage() {
  redirect("/admin/setup");
}
