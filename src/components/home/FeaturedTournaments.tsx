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
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">
          Featured <span className="section-title-accent">Tournaments</span>
        </h2>
        <Link 
          to="/standings"
          className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4 h-40 animate-pulse">
              <div className="h-6 w-16 bg-secondary rounded mb-3" />
              <div className="h-4 w-3/4 bg-secondary rounded mb-2" />
              <div className="h-3 w-1/2 bg-secondary rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tournaments.slice(0, 4).map((tournament) => {
            const status = statusConfig[tournament.status as keyof typeof statusConfig] || statusConfig.upcoming;
            
            return (
              <Link
                key={tournament.id}
                to={`/standings?tournament=${tournament.id}`}
                className="glass-card p-4 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`status-badge ${status.className}`}>{status.label}</span>
                  <EYLLogo size={32} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {tournament.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {tournament.description?.slice(0, 50) || "Matchday in progress"}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>16</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {tournament.start_date 
                        ? new Date(tournament.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "TBD"}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
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
