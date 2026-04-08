"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { BuildingIcon, MapPin, Briefcase } from "lucide-react";
import { getJobs } from "@/utils/api";
import Link from "next/link";

export default function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getJobs().then((jobs) => {
            // Збираємо унікальні компанії та рахуємо їхні вакансії
            const companyMap = new Map();

            jobs.forEach(job => {
                const name = job.company;
                if (!companyMap.has(name)) {
                    companyMap.set(name, {
                        name: name,
                        location: job.location.split(',')[0] || "Україна", // беремо місто або залишаємо дефолт
                        jobCount: 1,
                        // Генеруємо випадковий "опис" для краси
                        description: `Провідна компанія у своїй галузі, яка постійно розвивається та шукає талановитих спеціалістів.`
                    });
                } else {
                    const comp = companyMap.get(name);
                    comp.jobCount += 1;
                    companyMap.set(name, comp);
                }
            });

            // Перетворюємо Map в масив і сортуємо за кількістю вакансій (спадання)
            const companiesList = Array.from(companyMap.values()).sort((a, b) => b.jobCount - a.jobCount);
            setCompanies(companiesList);
            setLoading(false);
        });
    }, []);

    return (
        <div className="flex-1 py-10 bg-muted/5 min-h-screen">
            <Container>
                <div className="mb-8 text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Каталог компаній</h1>
                    <p className="text-lg text-muted-foreground">
                        Дізнайтеся більше про топових роботодавців, їхню корпоративну культуру та знайдіть ідеальне місце для роботи.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20 rounded-xl border bg-card">
                        <p className="text-muted-foreground">Завантаження каталогу...</p>
                    </div>
                ) : companies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companies.map((company, idx) => (
                            <div key={idx} className="bg-card border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-colors flex flex-col group h-full">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 text-primary font-bold text-xl">
                                        {company.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{company.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {company.location}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-muted-foreground text-sm flex-grow mb-6 line-clamp-3">
                                    {company.description}
                                </p>

                                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-sm font-medium">
                                        <div className="bg-primary/10 text-primary p-1 rounded">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <span>{company.jobCount} {company.jobCount === 1 ? 'вакансія' : (company.jobCount >= 2 && company.jobCount <= 4 ? 'вакансії' : 'вакансій')}</span>
                                    </div>
                                    <Link href={`/jobs?q=${encodeURIComponent(company.name)}`} className="text-sm font-medium text-primary hover:underline">
                                        Всі вакансії →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-xl border border-dashed bg-card/50">
                        <BuildingIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium mb-2">Наразі каталог порожній</h3>
                        <p className="text-muted-foreground">
                            Схоже, на платформі ще немає жодної активної вакансії від компаній.
                        </p>
                    </div>
                )}
            </Container>
        </div>
    );
}
