"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { Container } from "@/components/container";
import { JobCard } from "@/components/job-card";
import { getJobs } from "@/utils/api";
import { Search, Filter } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

function JobsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("q") || "";

    const [allJobs, setAllJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedFormats, setSelectedFormats] = useState([]);
    const [sortOption, setSortOption] = useState("date"); // "date" or "salary"

    useEffect(() => {
        getJobs().then((data) => {
            setAllJobs(data);
            setLoading(false);
        });
    }, []);

    // Синхронізація поля пошуку з URL (наприклад, «Назад» у браузері)
    /* eslint-disable react-hooks/set-state-in-effect -- потрібно оновити controlled input при зміні searchParams */
    useEffect(() => {
        setSearchQuery(searchParams.get("q") || "");
    }, [searchParams]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleTypeChange = (type) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleFormatChange = (format) => {
        setSelectedFormats(prev =>
            prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
        );
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const applySearchToUrl = () => {
        const params = new URLSearchParams(searchParams);
        if (searchQuery) {
            params.set('q', searchQuery);
        } else {
            params.delete('q');
        }
        router.push(`/jobs?${params.toString()}`);
    };

    // Filter logic
    const filteredJobs = useMemo(() => {
        let result = allJobs;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(job =>
                job.title.toLowerCase().includes(query) ||
                job.company.toLowerCase().includes(query) ||
                (job.requirements && job.requirements.some(req => req.toLowerCase().includes(query)))
            );
        }

        if (selectedTypes.length > 0) {
            result = result.filter(job => selectedTypes.includes(job.type));
        }

        if (selectedFormats.length > 0) {
            // Check location string for keywords since we don't have a rigid "format" field
            result = result.filter(job => {
                const loc = job.location.toLowerCase();
                if (selectedFormats.includes("Віддалено") && loc.includes("віддален")) return true;
                if (selectedFormats.includes("Гібрид") && loc.includes("гібрид")) return true;
                if (selectedFormats.includes("Офіс") && (!loc.includes("віддален") && !loc.includes("гібрид"))) return true;
                return false;
            });
        }

        // Add basic sorting
        if (sortOption === "salary") {
            // Rough salary parsing for demo
            result = [...result].sort((a, b) => {
                const aSal = parseInt(a.salary?.replace(/\D/g, '') || '0');
                const bSal = parseInt(b.salary?.replace(/\D/g, '') || '0');
                return bSal - aSal;
            });
        } else {
            // Date sorting (newest first)
            result = [...result].sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
        }

        return result;
    }, [allJobs, searchQuery, selectedTypes, selectedFormats, sortOption]);

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedTypes([]);
        setSelectedFormats([]);
        router.push("/jobs");
    };

    return (
        <div className="flex-1 py-10">
            <Container>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Пошук вакансій</h1>
                    <p className="text-muted-foreground">Знайдіть роботу, яка підходить саме вам</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
                        <div className="bg-card border rounded-xl p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-4 border-b pb-3">
                                <div className="flex items-center gap-2 font-semibold">
                                    <Filter className="h-5 w-5" />
                                    <span>Фільтри</span>
                                </div>
                                {(selectedTypes.length > 0 || selectedFormats.length > 0 || searchQuery !== "") && (
                                    <button onClick={resetFilters} className="text-xs text-primary hover:underline">
                                        Скинути
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Ключові слова</label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            onBlur={applySearchToUrl}
                                            onKeyDown={(e) => e.key === 'Enter' && applySearchToUrl()}
                                            placeholder="Посада, компанія..."
                                            className="w-full pl-9 pr-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Тип зайнятості</label>
                                    <div className="space-y-2">
                                        {["Повна зайнятість", "Часткова зайнятість", "Проєктна робота", "Стажування"].map((type) => (
                                            <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTypes.includes(type)}
                                                    onChange={() => handleTypeChange(type)}
                                                    className="rounded border-muted text-primary focus:ring-primary"
                                                />
                                                <span>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Формат роботи</label>
                                    <div className="space-y-2">
                                        {["Офіс", "Віддалено", "Гібрид"].map((format) => (
                                            <label key={format} className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFormats.includes(format)}
                                                    onChange={() => handleFormatChange(format)}
                                                    className="rounded border-muted text-primary focus:ring-primary"
                                                />
                                                <span>{format}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Job Listings Main Content */}
                    <main className="flex-1">
                        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
                            <span>Знайдено {loading ? "..." : filteredJobs.length} вакансій</span>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="bg-transparent border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="date">За датою (найновіші)</option>
                                <option value="salary">За зарплатою (спадання)</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 rounded-xl border bg-muted/10">
                                <p className="text-muted-foreground font-medium">Завантаження...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {filteredJobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))}

                                {filteredJobs.length === 0 && (
                                    <div className="text-center py-12 rounded-xl border border-dashed bg-muted/20">
                                        <p className="text-muted-foreground font-medium">За вашим запитом вакансій не знайдено</p>
                                        <button onClick={resetFilters} className="mt-4 text-primary hover:underline font-medium text-sm">
                                            Скинути всі фільтри
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </Container>
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={<div className="flex-1 py-20 flex justify-center items-center"><p className="text-muted-foreground">Завантаження сторінки...</p></div>}>
            <JobsContent />
        </Suspense>
    );
}
