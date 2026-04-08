"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import JobDetailsClient from "../JobDetailsClient";

function JobDetailInner() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    return <JobDetailsClient jobId={id} />;
}

export default function JobDetailPage() {
    return (
        <Suspense
            fallback={
                <div className="flex-1 py-20 flex justify-center items-center">
                    <p className="text-muted-foreground">Завантаження...</p>
                </div>
            }
        >
            <JobDetailInner />
        </Suspense>
    );
}
