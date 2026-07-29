"use client";

import { FormProvider, type FieldValues, type UseFormReturn } from "react-hook-form";

type FormProps<TFieldValues extends FieldValues> = {
  children: React.ReactNode;
} & UseFormReturn<TFieldValues>;

export function Form<TFieldValues extends FieldValues>({
  children,
  ...methods
}: FormProps<TFieldValues>) {
  return <FormProvider {...methods}>{children}</FormProvider>;
}
