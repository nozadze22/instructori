"use client";

import Link from "next/link";
import { Mail, MapPin, MessageSquare, Phone, UserRound, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { InstructorDirectoryItem } from "@/features/instructors/api/instructors";
import { userInitials } from "@/lib/user-display";

type InstructorDirectoryCardProps = {
  instructor: InstructorDirectoryItem;
};

export function InstructorDirectoryCard({
  instructor,
}: InstructorDirectoryCardProps) {
  const initials = userInitials({
    fullName: instructor.fullName,
    email: instructor.email,
  });

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-container-low/90 py-0 shadow-[0_12px_40px_rgb(0_0_0/35%)] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30">
      <CardHeader className="space-y-4 px-5 pt-5 pb-0">
        <div className="flex items-center gap-4">
          <Avatar className="size-24 shrink-0 rounded-3xl border border-primary/20 bg-surface-container shadow-lg shadow-black/20 ring-2 ring-white/10">
            {instructor.avatarUrl ? (
              <AvatarImage
                src={instructor.avatarUrl}
                alt={instructor.fullName}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="rounded-3xl bg-surface-container text-2xl font-bold text-primary">
              {initials || <UserRound className="size-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1.5">
            <h3 className="truncate text-lg font-bold text-foreground transition-colors group-hover:text-primary">
              {instructor.fullName}
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-primary" />
              {instructor.city || "ქალაქი არ არის მითითებული"}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5 text-primary" />
              {instructor.studentCount} სტუდენტი
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 px-5 pt-4">
        <div className="flex flex-wrap gap-1.5">
          {instructor.instructorCategories.map((category) => (
            <span
              key={category}
              className="rounded-lg border border-primary/15 bg-primary/8 px-2 py-1 text-[11px] font-semibold text-primary"
            >
              {category === "ALL" ? "ყველა კატეგორია" : `${category} კატეგორია`}
            </span>
          ))}
        </div>
        <p className="line-clamp-3 min-h-18 text-sm leading-6 text-muted-foreground">
          {instructor.bio || "ინსტრუქტორს ჯერ ბიო არ აქვს დამატებული."}
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            <span className="truncate">{instructor.email}</span>
          </p>
          {instructor.phone ? (
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-primary" />
              {instructor.phone}
            </p>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="mt-auto px-5 pt-2 pb-5">
        <Button
          render={<Link href={`/instructors/${instructor.id}`} />}
          className="h-11 w-full rounded-xl"
        >
          <MessageSquare className="size-4" />
          პროფილი და შეტყობინება
        </Button>
      </CardFooter>
    </Card>
  );
}
