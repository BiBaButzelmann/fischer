import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationCenter } from "@/components/notification/notification-center";
import { AppSidebarWrapper } from "@/components/sidebar/app-sidebar-wrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppSidebarWrapper />
      <main className="w-full">
        <div className="flex items-center justify-between px-4 md:px-10 py-4">
          <SidebarTrigger className="hover:bg-secondary hover:text-current" />
          <NotificationCenter />
        </div>
        <div className="min-h-[calc(100vh-92px)] px-4 md:px-10 pb-4 max-w-6xl mx-auto">
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
              <span className="mx-2">|</span>
              <a
                href="https://hsk1830.de/Kontakt#Anfahrt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                Anfahrt
              </a>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
