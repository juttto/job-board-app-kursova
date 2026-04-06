import Link from "next/link";
import { Briefcase, MapPin, DollarSign, Clock } from "lucide-react";

export function JobCard({ job }) {
    return (
        <div className="group rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col sm:flex-row gap-4 p-5">
            <div className="flex-shrink-0 h-16 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                {job.logo ? (
                    <img src={job.logo} alt={`${job.company} logo`} className="h-full w-full object-cover" />
                ) : (
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                )}
            </div>

            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                            <Link href={`/jobs/${job.id}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                                {job.title}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
                        </div>
                        {job.salary && (
                            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary self-start sm:self-auto px-2.5 py-0.5 rounded-full text-sm font-medium">
                                <DollarSign className="h-3.5 w-3.5" />
                                {job.salary}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                        {job.location && (
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                            </div>
                        )}
                        {job.type && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{job.type}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
