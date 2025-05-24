"use client";

import useResizeObserver from "@react-hook/resize-observer";
import { useState, useRef, useLayoutEffect } from "react";

export function ChessBoard() {
    const [size, setSize] = useState<{ width: number; height: number } | null>(
        null,
    );

    const target = useRef<HTMLDivElement>(null);
    useResizeObserver(target, (entry) =>
        setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
        }),
    );

    useLayoutEffect(() => {
        if (target.current == null) {
            return;
        }
        const { width, height } = target.current.getBoundingClientRect();
        setSize({
            width,
            height,
        });
    }, []);

    return (
        <div ref={target} className="h-full">
            <iframe
                src="https://fritz.chessbase.com?pos=wKe3,Re4/bKd5"
                style={{
                    width: size?.width,
                    height: size?.height,
                }}
            />
        </div>
    );
}
