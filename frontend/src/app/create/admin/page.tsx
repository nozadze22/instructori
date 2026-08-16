import { redirect } from "next/navigation";

export default function CreateAdminRedirectPage() {
  redirect("/admin/setup");
}
