"use client";

import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { EventDisplay } from "./event-display";
import { Button } from "../ui/button";

export function EventModal() {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };

    return (
        <Dialog defaultOpen>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Partie 123</DialogTitle>
                </DialogHeader>
                <div className="p-2">
                    <EventDisplay />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={handleClose}>Schließen</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
