const partners = [
  { abbr: "ET", name: "Ethio Telecom" },
  { abbr: "DB", name: "Dashen Bank" },
  { abbr: "EA", name: "Ethiopian Airlines" },
  { abbr: "AB", name: "Abyssinia Bank" },
  { abbr: "GO", name: "Gomeju Oil" },
];

export function PartnersSection() {
  return (
    <section className="border-y border-border/50 py-4 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8">
          <span className="text-muted-foreground text-sm whitespace-nowrap">Official Partners</span>
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
            {partners.map((partner) => (
              <div key={partner.abbr} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <span className="font-bold text-primary">{partner.abbr}</span>
                <span className="text-sm whitespace-nowrap">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
