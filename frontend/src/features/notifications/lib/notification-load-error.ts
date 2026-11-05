const DEV_HINT =
  "Dev: გაუშვი notification სერვისი (პორტი 4002) და გადატვირთე frontend.";

export type NotificationLoadErrorCopy = {
  title: string;
  hint?: string;
};

/** Copy for the bell popover when the notifications API fails. */
export function notificationLoadErrorCopy(): NotificationLoadErrorCopy {
  if (process.env.NODE_ENV === "development") {
    return {
      title: "შეტყობინებების ჩატვირთვა ვერ მოხერხდა.",
      hint: DEV_HINT,
    };
  }

  return {
    title: "შეტყობინებების ჩატვირთვა ახლა ვერ მოხერხდა.",
    hint: "სცადე ცოტა მოგვიანებით ან განაახლე გვერდი.",
  };
}
