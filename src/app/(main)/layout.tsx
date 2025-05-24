import { AppSidebar } from "@/components/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <AppSidebar />
            <main className="w-full relative">
                <SidebarTrigger className="absolute top-2 left-2 text-foreground" />
                {children}
            </main>
        </>
    );
}
