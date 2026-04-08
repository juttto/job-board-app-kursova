"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { loginWithGoogle } = useAuth();
    const router = useRouter();

    const handleGoogleRegister = async () => {
        setError("");
        setLoading(true);

        try {
            await loginWithGoogle();
            router.push("/");
        } catch (err) {
            console.error(err);
            setError("Помилка реєстрації через Google.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-muted/10">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary-foreground" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-bold tracking-tight">
                    Створіть свій акаунт
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Або{" "}
                    <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
                        увійдіть в існуючий
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-card py-8 px-4 shadow sm:rounded-xl sm:px-10 border text-center">
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-6">
                            {error}
                        </div>
                    )}
                    
                    <button
                        onClick={handleGoogleRegister}
                        disabled={loading}
                        className="flex w-full justify-center items-center gap-3 rounded-md bg-white border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70 transition-colors"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        {loading ? "Зачекайте..." : "Продовжити з Google"}
                    </button>
                    
                    <p className="mt-6 text-xs text-muted-foreground">
                        Увага: При першому вході ми запитаємо вашу роль: кандидата чи роботодавця.
                    </p>
                </div>
            </div>
        </div>
    );
}
