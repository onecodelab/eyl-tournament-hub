import { useSponsors } from "@/hooks/useSponsors";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export function PartnersSection() {
  const { data: sponsors = [] } = useSponsors("top");
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  // Generate abbreviation from name
  const getAbbr = (name: string) => {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  if (sponsors.length === 0) return null;

  return (
    <section className="relative border-y border-border/30 py-6 overflow-hidden bg-gradient-to-r from-background via-muted/20 to-background">
      {/* Subtle glow effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8">
          <span className="text-muted-foreground/70 text-xs uppercase tracking-widest whitespace-nowrap font-medium">
            Official Partners
          </span>
          
          <div className="flex-1 relative">
            {/* Edge fade effects */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <Carousel
              opts={{
                align: "start",
                loop: true,
                dragFree: true,
              }}
              plugins={[plugin.current]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {sponsors.map((sponsor) => (
                  <CarouselItem key={sponsor.id} className="pl-4 basis-auto">
                    <a
                      href={sponsor.website_url || "#"}
                      target={sponsor.website_url ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 hover:bg-primary/5"
                    >
                      <div className="relative">
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full scale-150" />
                        
                        {sponsor.logo_url ? (
                          <img 
                            src={sponsor.logo_url} 
                            alt={sponsor.name} 
                            className="relative h-6 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100" 
                          />
                        ) : (
                          <span className="relative font-semibold text-sm text-primary/60 group-hover:text-primary transition-colors duration-300">
                            {getAbbr(sponsor.name)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm whitespace-nowrap text-muted-foreground/60 group-hover:text-foreground transition-colors duration-300 font-medium">
                        {sponsor.name}
                      </span>
                    </a>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
