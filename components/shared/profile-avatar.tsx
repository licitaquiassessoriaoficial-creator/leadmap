import { cn, getInitials } from "@/lib/utils";

export function ProfileAvatar({
  name,
  imageUrl,
  className
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn("h-12 w-12 rounded-2xl object-cover shadow-sm", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-sm font-semibold text-brand-700",
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
