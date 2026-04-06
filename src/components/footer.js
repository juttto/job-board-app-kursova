import { Container } from "./container";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t py-12 md:py-16 mt-auto bg-muted/50">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="font-bold text-lg mb-4">JobBoard</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            Сучасна платформа для пошуку роботи та розміщення вакансій. Знайдіть роботу своєї мрії разом з нами.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-sm">Кандидатам</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/jobs" className="hover:text-primary transition-colors">Пошук вакансій</Link></li>
                            <li><Link href="/create-resume" className="hover:text-primary transition-colors">Створити резюме</Link></li>
                            <li><Link href="/companies" className="hover:text-primary transition-colors">Каталог компаній</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 text-sm">Роботодавцям</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/post-job" className="hover:text-primary transition-colors">Розмістити вакансію</Link></li>
                            <li><Link href="/candidates" className="hover:text-primary transition-colors">Пошук кандидатів</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary transition-colors">Прайс-лист</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} JobBoard. Усі права захищені.</p>
                </div>
            </Container>
        </footer>
    );
}
