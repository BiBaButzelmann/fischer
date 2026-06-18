export default async function Ausschreibung({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="w-full h-screen">
      <iframe
        src={`https://docs.google.com/gview?url=https://klubturnier.hsk1830.de/pdfs/${slug}/ausschreibung.pdf&embedded=true`}
        className="w-full h-full self-center"
        style={{ border: "none" }}
      />
    </div>
  );
}
