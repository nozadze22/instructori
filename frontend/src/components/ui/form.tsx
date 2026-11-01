"use client";

import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormProps<TFieldValues extends FieldValues> = {
  children: React.ReactNode;
} & UseFormReturn<TFieldValues>;

export function Form<TFieldValues extends FieldValues>({
  children,
  ...methods
}: FormProps<TFieldValues>) {
  return <FormProvider {...methods}>{children}</FormProvider>;
}

type FormFieldContextValue<TFieldName extends string> = {
  name: TFieldName;
};

const FormFieldContext = createContext<FormFieldContextValue<string> | null>(
  null,
);

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function FormItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("space-y-1.5", className)} {...props} />;
}

export function FormControl({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function FormMessage({ className }: { className?: string }) {
  const context = useContext(FormFieldContext);
  const { formState } = useFormContext();
  const message = context
    ? (formState.errors[context.name]?.message as string | undefined)
    : undefined;

  if (!message) return null;
  return (
    <p className={cn("text-xs font-medium text-destructive", className)}>
      {message}
    </p>
  );
}
