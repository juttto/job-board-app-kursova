"use client";

import { useEffect, useState, use } from "react";
import { getJobById } from "@/utils/api";
import { Container } from "@/components/container";
import { Briefcase, MapPin, DollarSign, Clock, Building2, ChevronLeft, CheckCircle2, Bookmark } from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function JobDetailsPage({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const jobId = resolvedParams.id;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    // Інтерактивні стани кнопок
    const [applied, setApplied] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        getJobById(jobId).then((data) => {
            if (!data) {
                router.replace("/404");
            } else {
                setJob(data);
            }
            setLoading(false);
        });
    }, [jobId, router]);

    // Перевірка, чи вакансія вже збережена / чи є відгук
    useEffect(() => {
        if (user && user.role === "candidate" && job) {
            // Перевірка збережених
            const savedJobs = JSON.parse(localStorage.getItem(`jobboard_saved_jobs_${user.uid}`) || "[]");
            if (savedJobs.includes(jobId)) {
                setSaved(true);
            }

            // Перевірка відгуків
            const applications = JSON.parse(localStorage.getItem(`jobboard_applications_${jobId}`) || "[]");
            if (applications.some(app => app.candidateId === user.uid)) {
                setApplied(true);
            }
        }
    }, [user, job, jobId]);

    if (loading) {
        return (
            <div className="flex-1 py-20 flex justify-center items-center">
                <p className="text-muted-foreground">Завантаження вакансії...</p>
            </div>
        );
    }

    if (!job) return null;

    const handleApply = () => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (user.role === "employer") {
            alert("Роботодавці не можуть відгукуватись на вакансії.");
            return;
        }

        // Зберігаємо відгук
        const applicationsKey = `jobboard_applications_${jobId}`;
        const applications = JSON.parse(localStorage.getItem(applicationsKey) || "[]");

        // Знаходимо резюме кандидата, якщо воно є
        const candidateResume = JSON.parse(localStorage.getItem(`jobboard_resume_${user.uid}`) || "{}");

        applications.push({
            candidateId: user.uid,
            email: user.email,
            date: new Date().toISOString(),
            resume: candidateResume
        });

        localStorage.setItem(applicationsKey, JSON.stringify(applications));
        setApplied(true);
    };

    const handleSave = () => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (user.role === "employer") {
            alert("Роботодавці не можуть зберігати вакансії.");
            return;
        }

        const savedKey = `jobboard_saved_jobs_${user.uid}`;
        let savedJobs = JSON.parse(localStorage.getItem(savedKey) || "[]");

        if (saved) {
            // Видалити зі збережених
            savedJobs = savedJobs.filter(id => id !== jobId);
            setSaved(false);
        } else {
            // Додати до збережених
            if (!savedJobs.includes(jobId)) {
                savedJobs.push(jobId);
            }
            setSaved(true);
        }

        localStorage.setItem(savedKey, JSON.stringify(savedJobs));
    };

    return (
        <div className="flex-1 py-10 bg-muted/10 min-h-[calc(100vh-140px)]">
            <Container>
                <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Назад до списку вакансій
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card border rounded-xl p-6 sm:p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center border-b pb-6 mb-6">
                                <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                                    {job.logo ? (
                                        <img src={job.logo} alt={job.company} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-muted-foreground select-none">
                                            {job.company.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{job.title}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                        <Link href={`/companies?q=${encodeURIComponent(job.company)}`} className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors">
                                            <Building2 className="h-4 w-4" />
                                            {job.company}
                                        </Link>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {job.location}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            {job.type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <h3 className="text-xl font-semibold mb-3">Опис вакансії</h3>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-8">
                                    {job.description}
                                </p>

                                {job.requirements && job.requirements.length > 0 && (
                                    <>
                                        <h3 className="text-xl font-semibold mb-3">Вимоги</h3>
                                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                            {job.requirements.map((req, i) => (
                                                <li key={i}>{req}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-card border rounded-xl p-6 shadow-sm lg:sticky lg:top-24">
                            <h3 className="font-semibold text-lg mb-4">Деталі</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-md text-primary">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Заробітна плата</p>
                                        <p className="font-medium">{job.salary || "За результатами співбесіди"}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-md text-primary">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Опубліковано</p>
                                        <p className="font-medium">
                                            {new Date(job.postedAt).toLocaleDateString("uk-UA", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!user || user.role !== "employer" ? (
                                <>
                                    <button
                                        onClick={handleApply}
                                        disabled={applied}
                                        className={`w-full font-medium py-3 flex items-center justify-center gap-2 rounded-md transition-all shadow-sm ${applied
                                            ? "bg-green-600 text-white cursor-default"
                                            : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                                            }`}
                                    >
                                        {applied ? (
                                            <><CheckCircle2 className="h-5 w-5" /> Ви відгукнулися</>
                                        ) : "Відгукнутися на вакансію"}
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        className={`w-full mt-3 border font-medium py-3 flex items-center justify-center gap-2 rounded-md transition-all cursor-pointer ${saved
                                            ? "bg-primary/10 text-primary border-primary/30"
                                            : "bg-transparent text-foreground hover:bg-muted"
                                            }`}
                                    >
                                        <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                                        {saved ? "Збережено" : "Зберегти в обране"}
                                    </button>
                                </>
                            ) : (
                                <div className="p-4 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground">
                                    Ви переглядаєте вакансію як роботодавець. Відгуки та збереження доступні лише для кандидатів.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}

