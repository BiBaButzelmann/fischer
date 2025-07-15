export default function Ausschreibung() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="http://docs.google.com/gview?url=https://your-domain.com/pdfs/ausschreibung.pdf&embedded=true"
        className="w-full h-full self-center"
        style={{ border: "none" }}
      />
    </div>
  );
}
