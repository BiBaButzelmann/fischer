"use client";

import React from "react";

type Props = {
  header: React.ReactElement;
  content: React.ReactElement;
  footer: React.ReactElement;
};

export function Sidepanel({ header, content, footer }: Props) {
  return (
    <div className="w-full flex flex-col h-full max-h-[570px]">
      <div className="h-full rounded-lg border border-gray-200 bg-card text-card-foreground shadow-sm flex flex-col">
        {header}
        <div className="flex-1 overflow-hidden">{content}</div>
        <div className="px-4 pb-4 border-t flex-shrink-0">{footer}</div>
      </div>
    </div>
  );
}
