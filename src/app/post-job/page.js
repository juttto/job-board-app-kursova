"use client";

import { useState } from "react";
import { Container } from "@/components/container";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Briefcase } from "lucide-react";
import Link from "next/link";

export default function PostJobPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("Київ, Україна (Можлива віддалена робота)");
    const [salary, setSalary] = useState("");
    const [type, setType] = useState("Повна зайнятість");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState("");

    if (!user) {
        return (
            <div className="flex-1 py-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Обмежений доступ</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Тільки авторизовані роботодавці можуть розміщувати вакансії на нашій платформі. Будь ласка, увійдіть у свій акаунт.
                </p>
                <Link href="/login" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
                    Увійти
                </Link>
            </div>
        );
    }

    if (user.role !== "employer") {
        return (
            <div className="flex-1 py-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Доступ заборонено</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Розміщувати вакансії можуть лише акаунти з роллю «Роботодавець».
                </p>
                <Link href="/profile" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
                    У кабінет
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { db } = await import("@/lib/firebase");
            const { collection, addDoc } = await import("firebase/firestore");

            const newJob = {
                title,
                company,
                location,
                salary,
                type,
                description,
                requirements: requirements.split("\n").filter(req => req.trim().length > 0),
                postedAt: new Date().toISOString(),
                employerId: user.uid
            };

            await addDoc(collection(db, "jobs"), newJob);

            showToast("Вакансію успішно опубліковано!", "success");
            router.push("/jobs");
        } catch (error) {
            console.error("Error adding document: ", error);
            showToast("Помилка публікації. Спробуйте пізніше.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 py-10 bg-muted/5">
            <Container>
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Розмістити вакансію</h1>
                        <p className="text-muted-foreground">Заповніть форму нижче, щоб додати нову вакансію на платформу.</p>
                    </div>

                    <div className="bg-card border rounded-xl p-6 sm:p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Назва посади *</label>
                                    <input
                                        type="text" required
                                        value={title} onChange={e => setTitle(e.target.value)}
                                        placeholder="Напр. Senior React Developer"
                                        className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Назва компанії *</label>
                                    <input
                                        type="text" required
                                        value={company} onChange={e => setCompany(e.target.value)}
                                        placeholder="Напр. Tech Solutions Corp."
                                        className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Локація *</label>
                                    <input
                                        type="text" required
                                        value={location} onChange={e => setLocation(e.target.value)}
                                        className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Заробітна плата</label>
                                    <input
                                        type="text"
                                        value={salary} onChange={e => setSalary(e.target.value)}
                                        placeholder="Напр. $2000 - $3000"
                                        className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Тип зайнятості *</label>
                                <select
                                    value={type} onChange={e => setType(e.target.value)}
                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option>Повна зайнятість</option>
                                    <option>Часткова зайнятість</option>
                                    <option>Проєктна робота</option>
                                    <option>Стажування</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Опис вакансії *</label>
                                <textarea
                                    required rows={5}
                                    value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="Опишіть основні обов'язки та умови роботи..."
                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Вимоги до кандидата</label>
                                <p className="text-xs text-muted-foreground mb-2">Кожна вимога з нового рядка</p>
                                <textarea
                                    rows={4}
                                    value={requirements} onChange={e => setRequirements(e.target.value)}
                                    placeholder="- Досвід від 2 років&#10;- Знання React, Next.js"
                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                            </div>

                            <div className="pt-4 border-t">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
                                >
                                    {loading ? "Публікація..." : "Опублікувати вакансію"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Container>
        </div>
    );
}
