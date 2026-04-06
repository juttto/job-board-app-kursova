"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/container";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, Briefcase, FileText, Bookmark, Settings, Trash2, MapPin, Clock, Users } from "lucide-react";
import { getJobs, deleteLocalJob } from "@/utils/api";
import Link from "next/link";

export default function ProfilePage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [myJobs, setMyJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(false);

    // Нові стани
    const [savedJobs, setSavedJobs] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(false);
    const [jobApplications, setJobApplications] = useState({}); // { [jobId]: [array of applications] }
    const [hasResume, setHasResume] = useState(false);

    useEffect(() => {
        if (loading) return; // Чекаємо завершення ініціалізації AuthContext

        if (!user) {
            router.push("/login");
            return;
        }

        const isEmployer = user.role === "employer";

        if (isEmployer) {
            setLoadingJobs(true);
            getJobs().then(jobs => {
                const employerJobs = jobs.filter(job => job.employerId === user.uid);
                setMyJobs(employerJobs);

                // Завантаження відгуків на власні вакансії
                const appsMap = {};
                employerJobs.forEach(job => {
                    const applications = JSON.parse(localStorage.getItem(`jobboard_applications_${job.id}`) || "[]");
                    if (applications.length > 0) {
                        appsMap[job.id] = applications;
                    }
                });
                setJobApplications(appsMap);
                setLoadingJobs(false);
            });
        } else {
            // Кандидат
            setLoadingSaved(true);
            const savedJobIds = JSON.parse(localStorage.getItem(`jobboard_saved_jobs_${user.uid}`) || "[]");

            // Перевіряємо чи є резюме
            const resume = localStorage.getItem(`jobboard_resume_${user.uid}`);
            setHasResume(!!resume);

            if (savedJobIds.length > 0) {
                getJobs().then(allJobs => {
                    const saved = allJobs.filter(job => savedJobIds.includes(job.id));
                    setSavedJobs(saved);
                    setLoadingSaved(false);
                });
            } else {
                setLoadingSaved(false);
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex-1 py-10 bg-muted/5 min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Завантаження профілю...</p>
            </div>
        );
    }

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    const handleDeleteJob = async (id) => {
        if (confirm("Ви дійсно хочете видалити цю вакансію? Всі відгуки на неї також не відображатимуться.")) {
            await deleteLocalJob(id);
            setMyJobs(prev => prev.filter(job => String(job.id) !== String(id)));
        }
    };

    const handleUnsaveJob = (id) => {
        const savedKey = `jobboard_saved_jobs_${user.uid}`;
        const newSavedIds = savedJobs.filter(job => String(job.id) !== String(id)).map(job => String(job.id));
        localStorage.setItem(savedKey, JSON.stringify(newSavedIds));
        setSavedJobs(prev => prev.filter(job => String(job.id) !== String(id)));
    };

    const isEmployer = user.role === "employer";

    return (
        <div className="flex-1 py-10 bg-muted/5 min-h-screen">
            <Container>
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-card border rounded-xl p-6 mb-6 shadow-sm text-center">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserIcon className="w-10 h-10" />
                            </div>
                            <h2 className="font-semibold text-lg truncate" title={user.email}>{user.email.split('@')[0]}</h2>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                            <span className="inline-block mt-3 px-3 py-1 bg-muted rounded-full text-xs font-medium">
                                {isEmployer ? "Роботодавець" : "Кандидат"}
                            </span>
                        </div>

                        <div className="bg-card border rounded-xl p-3 shadow-sm flex flex-col gap-1">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left ${activeTab === "overview" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}
                            >
                                <UserIcon className="w-4 h-4" /> Огляд профілю
                            </button>

                            {isEmployer ? (
                                <>
                                    <button
                                        onClick={() => setActiveTab("my-jobs")}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left ${activeTab === "my-jobs" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}
                                    >
                                        <Briefcase className="w-4 h-4" /> Мої вакансії
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("applications")}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left ${activeTab === "applications" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}
                                    >
                                        <Users className="w-4 h-4" /> Відгуки кандидатів
                                        {Object.values(jobApplications).flat().length > 0 && (
                                            <span className="ml-auto bg-primary text-primary-foreground text-xs py-0.5 px-2 rounded-full">
                                                {Object.values(jobApplications).flat().length}
                                            </span>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setActiveTab("saved")}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left ${activeTab === "saved" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}
                                    >
                                        <Bookmark className="w-4 h-4" /> Збережені вакансії
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("resume")}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left ${activeTab === "resume" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"}`}
                                    >
                                        <FileText className="w-4 h-4" /> Моє резюме
                                    </button>
                                </>
                            )}

                            <hr className="my-2 border-border" />

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" /> Вийти з акаунта
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm min-h-[500px]">
                            {/* OVERVIEW TAB */}
                            {activeTab === "overview" && (
                                <div>
                                    <h3 className="text-2xl font-bold mb-6">Ласкаво просимо до особистого кабінету!</h3>
                                    <p className="text-muted-foreground mb-8">
                                        Тут ви можете керувати своїм акаунтом та взаємодіяти з платформою.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="border rounded-lg p-5 flex items-start gap-4">
                                            <div className="bg-primary/10 p-3 rounded-md text-primary">
                                                <Settings className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-1">Налаштування</h4>
                                                <p className="text-sm text-muted-foreground">Управління паролем та Email</p>
                                            </div>
                                        </div>

                                        {!isEmployer && (
                                            <div className="border rounded-lg p-5 flex items-start gap-4">
                                                <div className={`p-3 rounded-md ${hasResume ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"}`}>
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-1">Статус резюме</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {hasResume ? "Резюме заповнено" : "Резюме ще не створено"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* EMPLOYER: MY JOBS TAB */}
                            {activeTab === "my-jobs" && isEmployer && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold">Опубліковані вакансії</h3>
                                        <button
                                            onClick={() => router.push("/post-job")}
                                            className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                                        >
                                            + Додати нову
                                        </button>
                                    </div>

                                    {loadingJobs ? (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground">Завантаження...</p>
                                        </div>
                                    ) : myJobs.length > 0 ? (
                                        <div className="space-y-4">
                                            {myJobs.map(job => (
                                                <div key={job.id} className="border rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-border hover:shadow-sm transition-all duration-200">
                                                    <div>
                                                        <Link href={`/jobs/${job.id}`} className="font-semibold text-lg hover:text-primary transition-colors block mb-1">
                                                            {job.title}
                                                        </Link>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(job.postedAt).toLocaleDateString("uk-UA")}</span>
                                                            {jobApplications[job.id] && (
                                                                <span className="flex items-center gap-1 text-primary font-medium">
                                                                    <Users className="w-3.5 h-3.5" /> Відгуків: {jobApplications[job.id].length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                                        <button
                                                            onClick={() => handleDeleteJob(job.id)}
                                                            className="flex items-center justify-center w-full sm:w-auto gap-2 px-3 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive hover:text-white rounded-md transition-colors"
                                                            title="Видалити вакансію"
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Видалити
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                                            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                            <p className="text-muted-foreground mt-2">Ви ще не опублікували жодної вакансії</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* EMPLOYER: APPLICATIONS TAB */}
                            {activeTab === "applications" && isEmployer && (
                                <div>
                                    <h3 className="text-2xl font-bold mb-6">Відгуки кандидатів</h3>

                                    {Object.keys(jobApplications).length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                                            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                            <p className="text-muted-foreground mt-2">Поки що немає жодного відгуку на ваші вакансії</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {myJobs.filter(job => jobApplications[job.id]).map(job => (
                                                <div key={job.id} className="border rounded-xl overflow-hidden">
                                                    <div className="bg-muted/30 px-5 py-3 border-b flex justify-between items-center">
                                                        <h4 className="font-semibold text-lg">{job.title}</h4>
                                                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                                                            {jobApplications[job.id].length} відгуків
                                                        </span>
                                                    </div>
                                                    <div className="divide-y">
                                                        {jobApplications[job.id].map((app, idx) => (
                                                            <div key={idx} className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-muted/5 transition-colors">
                                                                <div>
                                                                    <div className="font-medium text-lg mb-1">
                                                                        {app.resume?.fullName || app.email}
                                                                    </div>
                                                                    {app.resume?.title && (
                                                                        <div className="text-primary text-sm mb-2">{app.resume.title}</div>
                                                                    )}
                                                                    <div className="text-sm text-muted-foreground">
                                                                        Відгук від: {new Date(app.date).toLocaleDateString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </div>
                                                                {app.resume?.fullName ? (
                                                                    <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">
                                                                        <FileText className="w-4 h-4" /> Переглянути резюме
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-sm text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-md">
                                                                        Профіль не заповнено
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CANDIDATE: SAVED JOBS TAB */}
                            {activeTab === "saved" && !isEmployer && (
                                <div>
                                    <h3 className="text-2xl font-bold mb-6">Збережені вакансії</h3>

                                    {loadingSaved ? (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground">Завантаження збережених вакансій...</p>
                                        </div>
                                    ) : savedJobs.length > 0 ? (
                                        <div className="space-y-4">
                                            {savedJobs.map(job => (
                                                <div key={job.id} className="border rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                                                    <div>
                                                        <Link href={`/jobs/${job.id}`} className="font-semibold text-lg hover:text-primary transition-colors block mb-1">
                                                            {job.title}
                                                        </Link>
                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                                                            <Briefcase className="w-3.5 h-3.5" />
                                                            {job.company}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(job.postedAt).toLocaleDateString("uk-UA")}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                                                        <Link
                                                            href={`/jobs/${job.id}`}
                                                            className="flex justify-center w-full sm:w-auto px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                                        >
                                                            Перейти
                                                        </Link>
                                                        <button
                                                            onClick={() => handleUnsaveJob(job.id)}
                                                            className="flex items-center justify-center w-full sm:w-auto gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground bg-muted/30 hover:bg-muted rounded-md transition-colors"
                                                            title="Прибрати зі збережених"
                                                        >
                                                            <Bookmark className="w-4 h-4 fill-muted-foreground" /> Прибрати
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                                            <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                            <p className="text-muted-foreground mt-2">Ви ще не зберегли жодної вакансії</p>
                                            <Link href="/jobs" className="text-primary hover:underline mt-2 inline-block text-sm">
                                                Перейти до пошуку вакансій
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CANDIDATE: RESUME TAB */}
                            {activeTab === "resume" && !isEmployer && (
                                <div>
                                    <h3 className="text-2xl font-bold mb-6">Моє резюме</h3>

                                    {hasResume ? (
                                        <div className="border rounded-xl p-8 bg-gradient-to-br from-card to-muted/20 relative overflow-hidden">
                                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>

                                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex justify-center items-center">
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold">Резюме заповнено</h4>
                                                    <p className="text-muted-foreground text-sm">Тепер роботодавці можуть бачити вас у каталозі.</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 relative z-10">
                                                <button
                                                    onClick={() => router.push("/create-resume")}
                                                    className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
                                                >
                                                    <Settings className="w-4 h-4" /> Редагувати
                                                </button>
                                                <Link
                                                    href="/candidates"
                                                    className="bg-secondary text-secondary-foreground text-sm font-medium px-5 py-2.5 rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
                                                >
                                                    Переглянути в каталозі
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                                            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                                            <p className="text-muted-foreground mb-4">У вас ще немає створеного резюме</p>
                                            <button
                                                onClick={() => router.push("/create-resume")}
                                                className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-block"
                                            >
                                                Створити резюме
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
