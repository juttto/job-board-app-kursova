import fs from "fs";
import path from "path";
import JobDetailsClient from "../JobDetailsClient";

export async function generateStaticParams() {
    try {
        const filePath = path.join(process.cwd(), "public", "data", "jobs.json");
        const fileContents = fs.readFileSync(filePath, "utf8");
        const staticJobs = JSON.parse(fileContents);

        return staticJobs.map((job) => ({
            id: String(job.id),
        }));
    } catch (e) {
        console.error("Помилка генерації статичних параметрів:", e);
        return [];
    }
}

export default async function JobDetailsLegacyPage({ params }) {
    const { id } = await params;
    return <JobDetailsClient jobId={id} />;
}
