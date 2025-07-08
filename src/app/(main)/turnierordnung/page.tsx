export default function Turnierordnung() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="/pdfs/turnierordnung.pdf"
        className="w-full h-full self-center"
        style={{ border: "none" }}
      />
    </div>
  );
}
