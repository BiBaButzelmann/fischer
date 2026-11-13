import { ReactNode } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RosterTabsList({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto border-b px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
      <TabsList className="h-auto gap-1 rounded-none bg-transparent p-0">
        {children}
      </TabsList>
    </div>
  );
}

export function RosterTab({
  value,
  label,
  count,
}: {
  value: string;
  label: string;
  count: number;
}) {
  return (
    <TabsTrigger
      value={value}
      className="relative rounded-none px-2.5 pb-2.5 pt-1.5 after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:rounded-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-foreground"
    >
      {label}
      <span className="ml-1.5 font-mono text-xs tabular-nums text-muted-foreground">
        {count}
      </span>
    </TabsTrigger>
  );
}
