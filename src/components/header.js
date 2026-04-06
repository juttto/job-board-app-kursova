"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Container } from "./container";
import { Briefcase, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
    const { user, logout, loading } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <Briefcase className="h-6 w-6 text-primary" />
                            <span>Job<span className="text-primary">Board</span></span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link href="/jobs" className="transition-colors hover:text-primary">
                            Вакансії
                        </Link>
                        <Link href="/companies" className="transition-colors hover:text-primary text-muted-foreground">
                            Компанії
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {!loading && (
                            <>
                                {user ? (
                                    <div className="flex items-center gap-4">
                                        {user.role === "employer" && (
                                            <Link
                                                href="/post-job"
                                                className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/20 transition-colors"
                                            >
                                                Редагувати вакансії
                                            </Link>
                                        )}
                                        <Link href="/profile" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors group">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <UserIcon className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="hidden md:inline-block truncate max-w-[120px]">{user.email.split('@')[0]}</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                                    >
                                        Увійти
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </Container>
        </header>
    );
}
