"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";
import { FileText, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CreateResumePage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form state
    const [fullName, setFullName] = useState("");
    const [title, setTitle] = useState("");
    const [about, setAbout] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [skills, setSkills] = useState("");

    // Dynamic fields
    const [experiences, setExperiences] = useState([{ id: 1, company: "", position: "", period: "", description: "" }]);
    const [education, setEducation] = useState([{ id: 1, institution: "", degree: "", year: "" }]);

    useEffect(() => {
        if (user) {
            // Load existing resume if any
            const savedResume = localStorage.getItem(`jobboard_resume_${user.uid}`);
            if (savedResume) {
                const data = JSON.parse(savedResume);
                setFullName(data.fullName || "");
                setTitle(data.title || "");
                setAbout(data.about || "");
                setPhone(data.phone || "");
                setLocation(data.location || "");
                setSkills(data.skills ? data.skills.join(", ") : "");
                if (data.experiences && data.experiences.length > 0) setExperiences(data.experiences);
                if (data.education && data.education.length > 0) setEducation(data.education);
            }
        }
    }, [user]);

    if (!user) {
        return (
            <div className="flex-1 py-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Обмежений доступ</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Тільки авторизовані кандидати можуть створювати резюме. Будь ласка, увійдіть у свій акаунт.
                </p>
                <Link href="/login" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
                    Увійти
                </Link>
            </div>
        );
    }

    if (user.role === "employer") {
        return (
            <div className="flex-1 py-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Доступ заборонено</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Роботодавці не можуть створювати резюме. Ваш акаунт призначений для розміщення вакансій.
                </p>
                <Link href="/profile" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
                    У кабінет
                </Link>
            </div>
        );
    }

    const addExperience = () => {
        setExperiences([...experiences, { id: Date.now(), company: "", position: "", period: "", description: "" }]);
    };

    const removeExperience = (id) => {
        if (experiences.length > 1) {
            setExperiences(experiences.filter(exp => exp.id !== id));
        }
    };

    const updateExperience = (id, field, value) => {
        setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
    };

    const addEducation = () => {
        setEducation([...education, { id: Date.now(), institution: "", degree: "", year: "" }]);
    };

    const removeEducation = (id) => {
        if (education.length > 1) {
            setEducation(education.filter(edu => edu.id !== id));
        }
    };

    const updateEducation = (id, field, value) => {
        setEducation(education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const resumeData = {
            userId: user.uid,
            email: user.email,
            fullName,
            title,
            about,
            phone,
            location,
            skills: skills.split(",").map(s => s.trim()).filter(s => s.length > 0),
            experiences,
            education,
            updatedAt: new Date().toISOString()
        };

        // Затримка для імітації мережі
        await new Promise(resolve => setTimeout(resolve, 800));

        localStorage.setItem(`jobboard_resume_${user.uid}`, JSON.stringify(resumeData));

        // Також можна зберегти в загальний масив кандидатів (для сторінки "Кандидати")
        const allCandidates = JSON.parse(localStorage.getItem("jobboard_candidates") || "[]");
        const existingIndex = allCandidates.findIndex(c => c.userId === user.uid);

        if (existingIndex >= 0) {
            allCandidates[existingIndex] = resumeData;
        } else {
            allCandidates.push(resumeData);
        }
        localStorage.setItem("jobboard_candidates", JSON.stringify(allCandidates));

        setLoading(false);
        showToast("Резюме успішно збережено!", "success");
        router.push("/profile");
    };

    return (
        <div className="flex-1 py-10 bg-muted/5">
            <Container>
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Моє резюме</h1>
                            <p className="text-muted-foreground">Створіть або оновіть свій професійний профіль</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6 pb-2 border-b">Особиста інформація</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Ім'я та прізвище *</label>
                                    <input
                                        type="text" required
                                        value={fullName} onChange={e => setFullName(e.target.value)}
                                        placeholder="Іван Іваненко"
                                        className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Професія / Посада *</label>
                                    <input
                                        type="text" required
                                        value={title} onChange={e => setTitle(e.target.value)}
                                        placeholder="Frontend Розробник"
                                        className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Телефон</label>
                                    <input
                                        type="tel"
                                        value={phone} onChange={e => setPhone(e.target.value)}
                                        placeholder="+380..."
                                        className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Локація / Місто *</label>
                                    <input
                                        type="text" required
                                        value={location} onChange={e => setLocation(e.target.value)}
                                        placeholder="Київ, Україна"
                                        className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Про себе *</label>
                                    <textarea
                                        required rows={4}
                                        value={about} onChange={e => setAbout(e.target.value)}
                                        placeholder="Коротко розкажіть про свій професійний досвід та цілі..."
                                        className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
                            <h2 className="text-xl font-semibold mb-6 pb-2 border-b">Навички</h2>
                            <div>
                                <label className="block text-sm font-medium mb-2">Ключові навички (через кому)</label>
                                <input
                                    type="text"
                                    value={skills} onChange={e => setSkills(e.target.value)}
                                    placeholder="JavaScript, React, Node.js, Git..."
                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6 pb-2 border-b">
                                <h2 className="text-xl font-semibold">Досвід роботи</h2>
                                <button type="button" onClick={addExperience} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> Додати місце
                                </button>
                            </div>

                            <div className="space-y-8">
                                {experiences.map((exp, index) => (
                                    <div key={exp.id} className="relative bg-muted/10 p-4 rounded-lg border border-transparent hover:border-border transition-colors group">
                                        {experiences.length > 1 && (
                                            <button type="button" onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Компанія</label>
                                                <input
                                                    type="text" required
                                                    value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                                                    placeholder="Назва компанії"
                                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Посада</label>
                                                <input
                                                    type="text" required
                                                    value={exp.position} onChange={e => updateExperience(exp.id, 'position', e.target.value)}
                                                    placeholder="Ваша посада"
                                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1">Період (місяць рік - місяць рік)</label>
                                                <input
                                                    type="text"
                                                    value={exp.period} onChange={e => updateExperience(exp.id, 'period', e.target.value)}
                                                    placeholder="Червень 2021 - Поточний час"
                                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1">Опис обов'язків</label>
                                                <textarea
                                                    rows={3}
                                                    value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                                                    placeholder="Чим ви займалися на цій посаді..."
                                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6 pb-2 border-b">
                                <h2 className="text-xl font-semibold">Освіта</h2>
                                <button type="button" onClick={addEducation} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> Додати заклад
                                </button>
                            </div>

                            <div className="space-y-6">
                                {education.map((edu) => (
                                    <div key={edu.id} className="relative bg-muted/10 p-4 rounded-lg border border-transparent hover:border-border transition-colors">
                                        {education.length > 1 && (
                                            <button type="button" onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1">Навчальний заклад</label>
                                                <input
                                                    type="text" required
                                                    value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)}
                                                    placeholder="Назва університету чи школи"
                                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Спеціальність / Ступінь</label>
                                                <input
                                                    type="text" required
                                                    value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                                                    placeholder="Бакалавр комп'ютерних наук"
                                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">Рік випуску</label>
                                                <input
                                                    type="text"
                                                    value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)}
                                                    placeholder="2024"
                                                    className="w-full bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-border">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-primary-foreground font-medium py-3 px-8 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                {loading ? "Збереження..." : "Зберегти резюме"}
                            </button>
                        </div>
                    </form>
                </div>
            </Container>
        </div>
    );
}
