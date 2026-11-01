import { redirect } from "next/navigation";

export default function MistakeNotesNewRedirectPage() {
  redirect("/notes/new");
}
