export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-grow justify-center items-center">
      <div className="w-2/3 max-w-4xl">{children}</div>
    </div>
  );
}
