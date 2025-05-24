import { AppSidebar } from "@/components/sidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <AppSidebar />
            <main className="w-full">{children}</main>
        </>
    );
}
