export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-grow justify-center items-center">
      <main className="w-full xl:w-2/3 xl:max-w-5xl px-4 py-12">
        {children}
      </main>
    </div>
  );
}
