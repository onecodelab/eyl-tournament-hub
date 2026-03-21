import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar } from "lucide-react";
import { useTournaments } from "@/hooks/useSupabaseData";
import { EYLLogo } from "@/components/EYLLogo";

const statusConfig = {
  ongoing: { label: "LIVE", className: "status-live" },
  upcoming: { label: "SOON", className: "status-upcoming" },
  completed: { label: "DONE", className: "status-completed" },
};

export function FeaturedTournaments() {
  const { data: tournaments = [], isLoading } = useTournaments();

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">
          Featured <span className="section-title-accent">Tournaments</span>
        </h2>
        <Link 
          to="/standings"
          className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition-colors touch-target"
        >
          View All
          <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4 h-[110px] animate-pulse">
              <div className="h-5 w-14 bg-secondary rounded mb-2" />
              <div className="h-4 w-3/4 bg-secondary rounded mb-1.5" />
              <div className="h-3 w-1/2 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tournaments.slice(0, 4).map((tournament) => {
            const status = statusConfig[tournament.status as keyof typeof statusConfig] || statusConfig.upcoming;
            
            return (
              <Link
                key={tournament.id}
                to={`/standings?tournament=${tournament.id}`}
                className="relative glass-card-hover p-4 group min-h-[110px]"
              >
                {/* Status Badge - Absolute Top Right */}
                <span className={`absolute top-3 right-3 status-badge ${status.className}`}>
                  {status.label}
                </span>

                <div className="flex items-start gap-3 mb-2">
                  <EYLLogo size={28} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="flex-1 min-w-0 pr-12">
                    <h3 className="font-semibold text-[15px] leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {tournament.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {tournament.description?.slice(0, 50) || "Matchday in progress"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-auto pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" strokeWidth={1.5} />
                    <span>16</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" strokeWidth={1.5} />
                    <span>
                      {tournament.start_date 
                        ? new Date(tournament.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "TBD"}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1 bg-secondary/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      tournament.status === "completed" 
                        ? "bg-muted-foreground w-full" 
                        : tournament.status === "ongoing"
                        ? "bg-primary w-2/3"
                        : "bg-primary/30 w-0"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
