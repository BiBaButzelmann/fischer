import { Calendar } from "@/components/calendar";

export default async function Page() {
    return (
        <div>
            <span className="text-xl font-bold">Turnierplan</span>
            <Calendar />
        </div>
    );
}
