import { AppSidebar } from "@/components/sidebar";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
// import { SidebarTrigger } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
  events,
}: Readonly<{
  children: React.ReactNode;
  events: React.ReactNode;
}>) {
  return (
    <>
      {/* TODO: if user is not authed, redirect to welcome page */}
      <RedirectToSignIn />
      <AppSidebar />
      <main className="w-full relative">
        {/* <SidebarTrigger className="absolute top-2 left-2 text-foreground" /> */}
        <div className="px-4 py-4 max-w-4xl mx-auto">
          {children}
          {events}
        </div>
      </main>
    </>
  );
}
