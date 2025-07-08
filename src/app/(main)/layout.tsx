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
            <p>
              <a
                href="https://hsk1830.de/Datenschutz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                Datenschutz
              </a>
              <span className="mx-2">|</span>
              <a
                href="https://hsk1830.de/impressum"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                Impressum
              </a>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
