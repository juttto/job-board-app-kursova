"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { JobCard } from "@/components/job-card";
import { getJobs } from "@/utils/api";
import { Search } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getJobs().then((data) => {
      // Показуємо тільки останні 4 вакансії на головній
      setJobs(data.slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 md:py-32 border-b">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Знайдіть роботу своєї <span className="text-primary">мрії</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Тисячі вакансій від найкращих компаній. Зареєструйтесь, створіть резюме та отримайте пропозицію вже сьогодні.
            </p>

            <form
              className="flex w-full items-center space-x-2 max-w-xl mx-auto bg-background border rounded-lg p-2 shadow-sm"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/jobs?q=${encodeURIComponent(searchQuery)}`;
              }}
            >
              <Search className="h-5 w-5 text-muted-foreground ml-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Посада, навички або компанія..."
                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm md:text-base px-2"
              />
              <Link href={`/jobs${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm transition-colors text-center">
                Знайти
              </Link>
            </form>
          </div>
        </Container>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-16 md:py-24 flex-1">
        <Container>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Останні вакансії</h2>
              <p className="text-muted-foreground">Перегляньте нові пропозиції від перевірених роботодавців</p>
            </div>
            <Link href="/jobs" className="hidden sm:inline-flex text-primary hover:text-primary-hover font-medium items-center gap-1 transition-colors">
              Всі вакансії →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 rounded-lg border bg-muted/10">
              <p className="text-muted-foreground">Завантаження вакансій...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-lg border bg-muted/20">
              <p className="text-muted-foreground">Наразі немає доступних вакансій :(</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/jobs" className="inline-flex w-full justify-center bg-muted hover:bg-muted/80 text-foreground font-medium py-2.5 rounded-md transition-colors">
              Переглянути всі вакансії
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
