export default function setupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="w-full relative">
      <div className="px-4 py-4 max-w-4xl mx-auto">{children}</div>
    </main>
  );
}
