import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MistakeNotesEditRedirectPage({ params }: Props) {
  const { id } = await params;
  redirect(`/notes/${id}/edit`);
}
