export async function getJobs() {
    try {
        // Fetch runs in browser (components will be converted to Client Components)
        const response = await fetch('/data/jobs.json', {
            cache: 'no-store'
        });

        let initialJobs = [];
        if (response.ok) {
            initialJobs = await response.json();
        } else {
            console.error(`HTTP error! status: ${response.status}`);
        }

        // Merge with local storage jobs
        let localJobs = [];
        if (typeof window !== 'undefined') {
            const localData = localStorage.getItem('jobboard_local_jobs');
            if (localData) {
                localJobs = JSON.parse(localData);
            }
        }

        return [...localJobs, ...initialJobs];
    } catch (error) {
        console.error("Помилка завантаження вакансій:", error);
        return [];
    }
}

export async function getJobById(id) {
    try {
        const jobs = await getJobs();
        return jobs.find(job => String(job.id) === String(id)) || null;
    } catch (error) {
        console.error(`Помилка завантаження вакансії з ID ${id}:`, error);
        return null;
    }
}

export async function deleteLocalJob(id) {
    if (typeof window !== 'undefined') {
        const localData = localStorage.getItem('jobboard_local_jobs');
        if (localData) {
            let localJobs = JSON.parse(localData);
            localJobs = localJobs.filter(job => String(job.id) !== String(id));
            localStorage.setItem('jobboard_local_jobs', JSON.stringify(localJobs));
            return true;
        }
    }
    return false;
}
