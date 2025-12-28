import { ChevronUpIcon, ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { SortField, SortDirection } from "@/lib/types";

interface SortableHeaderProps {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onClick: () => void;
}

export function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onClick,
}: SortableHeaderProps) {
  const isActive = field === currentField;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
    >
      {label}
      <div className="flex flex-col">
        <ChevronUpIcon
          className={cn(
            "w-3 h-3 -mb-1",
            isActive && direction === "asc"
              ? "text-koru-purple"
              : "text-neutral-300 dark:text-neutral-600"
          )}
        />
        <ChevronDownIcon
          className={cn(
            "w-3 h-3",
            isActive && direction === "desc"
              ? "text-koru-purple"
              : "text-neutral-300 dark:text-neutral-600"
          )}
        />
      </div>
    </button>
  );
}


