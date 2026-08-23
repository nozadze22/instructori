import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PageFrameProps = {
  children: ReactNode;
  className?: string;
  ambient?: boolean;
};

export function PageFrame({
  children,
  className,
  ambient = true,
}: PageFrameProps) {
  return (
    <div className={cn("relative", className)}>
      {ambient ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="hero-gradient absolute inset-0 opacity-70" />
          <div className="absolute top-0 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-surface-lowest to-transparent" />
        </div>
      ) : null}
      <div className="relative z-10 space-y-8">{children}</div>
    </div>
  );
}

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl space-y-3">
        {eyebrow}
        <h1 className="text-2xl font-extrabold tracking-tight wrap-break-word text-foreground md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-xl text-sm leading-6 text-pretty text-muted-foreground md:text-base md:leading-7">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function PageEyebrow({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
      {icon}
      {children}
    </div>
  );
}

export function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
}) {
  return (
    <Card className="glass relative overflow-hidden rounded-2xl border-none bg-transparent py-4 ring-1 ring-white/10">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/8 via-transparent to-transparent" />
      <CardContent className="relative flex items-center justify-between gap-3 px-4">
        <div className="min-w-0">
          <CardDescription className="text-xs font-medium tracking-wide uppercase">
            {label}
          </CardDescription>
          <CardTitle className="mt-1 truncate text-2xl font-extrabold tracking-tight">
            {value}
          </CardTitle>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export function ContentPanel({
  children,
  className,
  bodyClassName,
}: {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "glass relative overflow-hidden rounded-[1.75rem] border-none bg-transparent py-0 shadow-[0_24px_60px_rgb(0_0_0/35%)] ring-1 ring-white/10",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
      <CardContent
        className={cn("relative space-y-5 px-4 py-4 md:px-5 md:py-5", bodyClassName)}
      >
        {children}
      </CardContent>
    </Card>
  );
}
