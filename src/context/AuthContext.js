"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Слухаємо зміни стану авторизації Firebase
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // Користувач увійшов. Перевіряємо, чи є він у нашій базі (LocalStorage)
                const users = JSON.parse(localStorage.getItem("jobboard_users_list") || "[]");
                let foundUser = users.find(u => u.uid === firebaseUser.uid);

                if (foundUser) {
                    // Користувач вже існує, встановлюємо його
                    setUser(foundUser);
                    localStorage.setItem("jobboard_user", JSON.stringify(foundUser));
                } else {
                    // Користувач увійшов вперше, але не має ролі
                    // Тимчасово встановлюємо його без ролі (щоб уникнути помилок рендеру)
                     setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName,
                        role: "candidate" // Fallback, але роль має встановлюватись при логіні
                    });
                }
            } else {
                setUser(null);
                localStorage.removeItem("jobboard_user");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            const users = JSON.parse(localStorage.getItem("jobboard_users_list") || "[]");
            let existingUser = users.find(u => u.uid === firebaseUser.uid);

            if (!existingUser) {
                // Це ПЕРШИЙ вхід. Запитуємо роль.
                const isEmployer = window.confirm(
                    "Увага! Оберіть вашу роль:\n\n" +
                    "Натисніть 'OK' — якщо ви РОБОТОДАВЕЦЬ 🏢\n" +
                    "Натисніть 'Cancel (Скасувати)' — якщо ви КАНДИДАТ (шукаєте роботу) 👨‍💻"
                );
                
                const role = isEmployer ? "employer" : "candidate";

                existingUser = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName,
                    role: role
                };
                
                // Зберігаємо нового користувача в 'базу'
                users.push(existingUser);
                localStorage.setItem("jobboard_users_list", JSON.stringify(users));
            }

            setUser(existingUser);
            localStorage.setItem("jobboard_user", JSON.stringify(existingUser));
            
        } catch (error) {
            console.error("Помилка входу через Firebase:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        await signOut(auth);
        setUser(null);
        localStorage.removeItem("jobboard_user");
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
