import { Container } from "@/components/container";
import { Receipt } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="flex-1 py-16 bg-muted/5">
            <Container>
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Прайс-лист для роботодавців</h1>
                    <p className="text-lg text-muted-foreground mb-12">
                        Прості та прозорі ціни для швидкого пошуку співробітників.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                        {/* Basic Plan */}
                        <div className="bg-card border rounded-xl p-8 shadow-sm">
                            <h3 className="text-2xl font-semibold mb-2">Стандарт</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">₴500</span>
                                <span className="text-muted-foreground"> / вакансія</span>
                            </div>
                            <ul className="space-y-3 mb-8 text-muted-foreground">
                                <li className="flex items-center gap-2"><span>✓</span> 30 днів публікації</li>
                                <li className="flex items-center gap-2"><span>✓</span> Базова підтримка</li>
                                <li className="flex items-center gap-2"><span>✓</span> Доступ до відгуків</li>
                            </ul>
                            <Link href="/login" className="block w-full text-center bg-primary/10 text-primary hover:bg-primary/20 font-medium py-2.5 rounded-md transition-colors">
                                Обрати тариф
                            </Link>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-primary text-primary-foreground border rounded-xl p-8 shadow-md relative">
                            <div className="absolute top-0 right-8 transform -translate-y-1/2">
                                <span className="bg-background text-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border">Популярний</span>
                            </div>
                            <h3 className="text-2xl font-semibold mb-2">Преміум</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">₴1500</span>
                                <span className="text-primary-foreground/80"> / вакансія</span>
                            </div>
                            <ul className="space-y-3 mb-8 text-primary-foreground/90">
                                <li className="flex items-center gap-2"><span>✓</span> Закріплення в топі на 7 днів</li>
                                <li className="flex items-center gap-2"><span>✓</span> Виділення кольором</li>
                                <li className="flex items-center gap-2"><span>✓</span> Розсилка кандидатам</li>
                                <li className="flex items-center gap-2"><span>✓</span> Персональний менеджер</li>
                            </ul>
                            <Link href="/login" className="block w-full text-center bg-background text-foreground hover:bg-muted font-medium py-2.5 rounded-md transition-colors">
                                Обрати тариф
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
