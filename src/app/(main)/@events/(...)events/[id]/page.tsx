import { EventModal } from "@/components/event";

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <EventModal />;
}
