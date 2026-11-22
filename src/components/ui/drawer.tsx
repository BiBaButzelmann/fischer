"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "@/lib/utils";

const ShowSwipeHandleContext = React.createContext(false);

function Drawer({
  showSwipeHandle = false,
  ...props
}: Omit<DrawerPrimitive.Root.Props, "swipeDirection" | "snapPoints"> & {
  showSwipeHandle?: boolean;
}) {
  return (
    <ShowSwipeHandleContext.Provider value={showSwipeHandle}>
      <DrawerPrimitive.Root
        data-slot="drawer"
        swipeDirection="down"
        {...props}
      />
    </ShowSwipeHandleContext.Provider>
  );
}

function DrawerClose(props: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 min-h-dvh select-none bg-black/10 opacity-[calc(1_-_var(--drawer-swipe-progress,0))] transition-opacity [transition-duration:450ms] [transition-timing-function:cubic-bezier(0.32,0.72,0,1)]",
        "data-[ending-style]:pointer-events-none data-[ending-style]:opacity-0 data-[ending-style]:[transition-duration:calc(var(--drawer-swipe-strength,1)_*_400ms)] data-[starting-style]:opacity-0 data-[swiping]:duration-0",
        "supports-[backdrop-filter]:backdrop-blur-[2px] supports-[-webkit-touch-callout:none]:absolute",
        className,
      )}
      {...props}
    />
  );
}

function DrawerSwipeHandle() {
  return (
    <div
      data-slot="drawer-swipe-handle"
      aria-hidden="true"
      className="relative z-10 flex h-3 w-full shrink-0 cursor-grab items-end justify-center after:block after:h-1.5 after:w-[100px] after:shrink-0 after:rounded-full after:bg-secondary active:cursor-grabbing"
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: DrawerPrimitive.Popup.Props) {
  const showSwipeHandle = React.useContext(ShowSwipeHandleContext);

  return (
    <DrawerPrimitive.Portal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        className="fixed inset-0 z-50 select-none"
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-popup"
          className={cn(
            "group/drawer-popup pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex max-h-[calc(100dvh_-_6rem)] min-h-0 origin-bottom select-none flex-col rounded-t-xl border-t bg-popover text-sm text-popover-foreground outline-none will-change-transform",
            "[transform:translate3d(0,var(--drawer-swipe-movement-y,0px),0)] transition-[transform,opacity] [transition-duration:450ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
            "data-[starting-style]:[transform:translate3d(0,calc(100%_+_2px),0)] data-[ending-style]:[transform:translate3d(0,calc(100%_+_2px),0)] data-[ending-style]:opacity-[0.9999] data-[ending-style]:[transition-duration:calc(var(--drawer-swipe-strength,1)_*_400ms)] data-[swiping]:duration-0 data-[ending-style]:data-[swiping]:[transition-duration:calc(var(--drawer-swipe-strength,1)_*_400ms)]",
            "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-12 after:bg-popover",
            className,
          )}
          {...props}
        >
          {showSwipeHandle ? <DrawerSwipeHandle /> : null}
          <DrawerPrimitive.Content
            data-slot="drawer-content"
            className="flex min-h-0 flex-1 select-text flex-col overflow-hidden overscroll-contain rounded-[inherit] group-data-[swiping]/drawer-popup:select-none"
          >
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-base font-medium text-foreground", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle };
