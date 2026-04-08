import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { getStaticJobsJsonUrl } from "@/lib/site";

export async function getJobs() {
    try {
        // Fetch static jobs
        let initialJobs = [];
        try {
            const isClient = typeof window !== "undefined";
            if (isClient) {
                const url = getStaticJobsJsonUrl();
                const response = await fetch(url, { cache: "no-store" });
                if (response.ok) {
                    initialJobs = await response.json();
                }
            }
        } catch (e) {
            console.error("Не вдалося завантажити статичні вакансії:", e);
        }

        // Fetch jobs from Firestore
        let firestoreJobs = [];
        const querySnapshot = await getDocs(collection(db, "jobs"));
        querySnapshot.forEach((doc) => {
            firestoreJobs.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Вважаємо всі static Jobs як дефолтні, якщо треба
        return [...firestoreJobs, ...initialJobs];
    } catch (error) {
        console.error("Помилка завантаження вакансій:", error);
        return [];
    }
}

export async function getJobById(id) {
    try {
        // Спочатку спробуємо знайти в статичних вакансіях
        const jobs = await getJobs();
        return jobs.find(job => String(job.id) === String(id)) || null;
    } catch (error) {
        console.error(`Помилка завантаження вакансії з ID ${id}:`, error);
        return null;
    }
}

export async function deleteLocalJob(id) {
    try {
        await deleteDoc(doc(db, "jobs", id));
        return true;
    } catch (error) {
        console.error("Error deleting job from Firestore:", error);
        return false;
    }
}
