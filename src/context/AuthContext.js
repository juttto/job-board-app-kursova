"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Слухаємо зміни стану авторизації Firebase
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Користувач увійшов. Шукаємо його у Firestore
                try {
                    const docRef = doc(db, "users", firebaseUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setUser(docSnap.data());
                    } else {
                        // Якщо документу немає (наприклад, попередній вхід без запису в Firestore),
                        // створюємо дефолтний профіль. Це критично для Firestore rules, які
                        // перевіряють роль користувача через /users/{uid}.
                        const newUser = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName,
                            role: "candidate",
                            savedJobs: []
                        };
                        await setDoc(docRef, newUser);
                        setUser(newUser);
                    }
                } catch (error) {
                    console.error("Помилка завантаження користувача з Firestore", error);
                }
            } else {
                setUser(null);
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

            const docRef = doc(db, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // Це ПЕРШИЙ вхід. Запитуємо роль.
                const isEmployer = window.confirm(
                    "Увага! Оберіть вашу роль:\n\n" +
                    "Натисніть 'OK' — якщо ви РОБОТОДАВЕЦЬ 🏢\n" +
                    "Натисніть 'Cancel (Скасувати)' — якщо ви КАНДИДАТ (шукаєте роботу) 👨‍💻"
                );
                
                const role = isEmployer ? "employer" : "candidate";

                const newUser = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName,
                    role: role,
                    savedJobs: []
                };
                
                // Зберігаємо нового користувача в Firestore
                await setDoc(docRef, newUser);
                setUser(newUser);
            } else {
                setUser(docSnap.data());
            }            
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
        setLoading(false);
    };

    const refreshUser = async () => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return;
        try {
            const docRef = doc(db, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUser(docSnap.data());
            } else {
                const newUser = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName,
                    role: "candidate",
                    savedJobs: []
                };
                await setDoc(docRef, newUser);
                setUser(newUser);
            }
        } catch (e) {
            console.error("Не вдалося оновити профіль користувача", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
