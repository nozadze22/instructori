export type MistakeCategoryRef = {
  id: string;
  code: string;
  label: string;
  icon: string;
};

export type MistakeSeverityRef = {
  id: string;
  code: string;
  label: string;
} | null;

export function fallbackCategoryMeta(code: string) {
  return {
    id: "",
    code,
    label: code,
    icon: "📝",
  } satisfies MistakeCategoryRef;
}
