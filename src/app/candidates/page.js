"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { Users, FileText, MapPin, Mail, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function CandidatesPage() {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Завантажуємо зі збережених в localStorage масивів кандидатів
        const allCandidates = JSON.parse(localStorage.getItem("jobboard_candidates") || "[]");
        setCandidates(allCandidates);
        setLoading(false);
    }, []);

    if (!user) {
        return (
            <div className="flex-1 py-16 bg-muted/5">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl font-bold tracking-tight mb-4">Пошук кандидатів</h1>
                        <p className="text-lg text-muted-foreground mb-12">
                            Знайдіть найкращих спеціалістів для вашого бізнесу серед багатьох резюме.
                        </p>

                        <div className="bg-card border rounded-xl p-12 shadow-sm text-center">
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-3">Отримайте доступ до бази резюме</h2>
                            <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                Щоб переглядати базу кандидатів та їхні контактні дані, будь ласка, увійдіть в акаунт.
                            </p>
                            <Link href="/login" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
                                Увійти до системи
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="flex-1 py-10 bg-muted/5 min-h-screen">
            <Container>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Каталог спеціалістів</h1>
                        <p className="text-muted-foreground">Знайдено резюме: {candidates.length}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 rounded-xl border bg-card">
                        <p className="text-muted-foreground">Завантаження бази кандидатів...</p>
                    </div>
                ) : candidates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {candidates.map((candidate, idx) => (
                            <div key={idx} className="bg-card border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4 border-b pb-4">
                                    <div>
                                        <h3 className="text-xl font-bold truncate" title={candidate.fullName}>{candidate.fullName}</h3>
                                        <p className="text-primary font-medium mt-1">{candidate.title}</p>
                                    </div>
                                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary font-bold text-lg">
                                        {candidate.fullName.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4 flex-grow text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{candidate.location}</span>
                                    </div>
                                    {candidate.phone && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{candidate.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{candidate.email}</span>
                                    </div>
                                </div>

                                {candidate.skills && candidate.skills.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.skills.slice(0, 3).map((skill, i) => (
                                                <span key={i} className="bg-muted px-2.5 py-1 rounded text-xs font-medium text-foreground">
                                                    {skill}
                                                </span>
                                            ))}
                                            {candidate.skills.length > 3 && (
                                                <span className="bg-muted px-2.5 py-1 rounded text-xs font-medium text-muted-foreground">
                                                    +{candidate.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto pt-4 border-t">
                                    <button className="w-full flex justify-center items-center gap-2 bg-secondary text-secondary-foreground py-2 rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium">
                                        <FileText className="w-4 h-4" /> Відкрити резюме
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-xl border border-dashed bg-card/50">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium mb-2">Наразі база порожня</h3>
                        <p className="text-muted-foreground">
                            Кандидати ще не встигли створити свої резюме на платформі.
                        </p>
                    </div>
                )}
            </Container>
        </div>
    );
}
