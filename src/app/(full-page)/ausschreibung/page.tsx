export default function Ausschreibung() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="/pdfs/ausschreibung.pdf"
        className="w-full h-full self-center"
        style={{ border: "none" }}
      />
    </div>
  );
}
