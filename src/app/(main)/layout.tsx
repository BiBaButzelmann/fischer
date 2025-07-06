import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
// import { SidebarTrigger } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppSidebar />
      <main className="w-full relative ">
        {/* <SidebarTrigger className="absolute top-2 left-2 text-foreground" /> */}
        <div className="min-h-screen px-4 py-4 max-w-6xl mx-auto">
          {children}
        </div>
        <footer>
          <Separator />
          <div className="text-center p-6 text-xs text-muted-foreground">
            <p>© 2025 HSK Klubturnier</p>
            <p>Kontakt: klubturnier@hsk1830.de</p>
          </div>
        </footer>
      </main>
    </>
  );
}
