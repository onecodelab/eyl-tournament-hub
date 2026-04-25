import { Layout } from "@/components/layout/Layout";
import { EYLLogo } from "@/components/EYLLogo";
import { 
  Target, 
  Eye, 
  Heart, 
  Trophy, 
  Users, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Handshake,
  Star,
  Shield,
  Zap,
  UserCheck,
  Search,
  Building,
  IdCard
} from "lucide-react";
import { Link } from "react-router-dom";

const coreValues = [
  {
    icon: Shield,
    title: "Integrity",
    description: "Honesty, transparency, and accuracy in every piece of data."
  },
  {
    icon: Users,
    title: "Inclusivity",
    description: "Giving equal opportunity to young talents from all regions and backgrounds."
  },
  {
    icon: Star,
    title: "Excellence",
    description: "Maintaining high standards in technology and service."
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Using modern tools to solve real problems in Ethiopian football."
  },
  {
    icon: Heart,
    title: "Community",
    description: "Building strong connections between players, academies, coaches, clubs, and fans."
  }
];

const dssFeatures = [
  {
    icon: UserCheck,
    title: "Player Profiles",
    description: "Detailed player profiles include stats, videos, and coach comments. Makes it easy for scouts to identify talent remotely."
  },
  {
    icon: Building,
    title: "Academy/Project Profiles",
    description: "Comprehensive profiles of youth academies with information, stats, coach details, and player rosters."
  },
  {
    icon: Search,
    title: "Scouts Premium Activity",
    description: "Scouts can access player profiles, watch videos, and review stats. Request detailed information, call players for trials, or watch them in action."
  },
  {
    icon: Star,
    title: "Ramiyone Scouts",
    description: "Dedicated scouts review player videos and prepare detailed reports. Provide assessments and recommend players to DSS partner clubs."
  }
];

const registrationSteps = [
  {
    icon: Building,
    title: "Academy/Project Registration",
    description: "Online registration form or via dedicated Telegram bot."
  },
  {
    icon: UserCheck,
    title: "Coach Registration",
    description: "Coaches register after the academy is approved."
  },
  {
    icon: Users,
    title: "Player Registration",
    description: "Team admins register players, manage profiles, and add new players."
  },
  {
    icon: IdCard,
    title: "Digital ID Request",
    description: "After registration, admins request digital IDs for players. IDs link directly to player profiles and can be used at tournaments and trials."
  }
];

const communityInitiatives = [
  {
    title: "Football for All",
    description: "Expanding opportunities for underserved areas to showcase talent."
  },
  {
    title: "Scout Development",
    description: "Empowering scouts to get licensed in talent identification."
  },
  {
    title: "Teams & Coaches Exposure",
    description: "Dedicated profiles for teams and coaches alongside players."
  }
];

export default function About() {
  return (
    <Layout>
      {/* Hero Section — Cinematic Professionalism */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-background">
        {/* Radical Glow Background (Brand Principle #4) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="data-precision-mono text-primary font-bold">OFFICIAL TOURNAMENT MANAGEMENT</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-black mb-8 text-white uppercase italic tracking-tighter leading-[0.95]">
                About the <br />
                <span className="text-primary drop-shadow-[0_0_30px_hsl(var(--primary)/0.4)]">Ethiopian Youth League</span>
              </h1>
              
              <div className="space-y-6 max-w-2xl">
                <p className="text-lg md:text-xl text-white/70 leading-relaxed font-medium">
                  The Ethiopian Youth League (EYL) is a high-performance digital tournament management platform developed by <span className="text-white font-bold italic">Ramiyone</span>.
                </p>
                <p className="text-lg text-white/50 leading-relaxed">
                  We digitize youth football from the ground up — providing elite-level match reporting, verified data documentation, and professional-grade visibility for the next generation of African talent.
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-all duration-700" />
              <div className="relative w-72 h-72 lg:w-[450px] lg:h-[450px] rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-3xl flex items-center justify-center shadow-2xl">
                <EYLLogo size={280} withGlow />
                {/* Orbital detail */}
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_20s_linear_infinite]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision — Analytical Precision */}
      <section className="py-24 bg-secondary/10 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="glass-card p-10 border-l-4 border-l-primary relative overflow-hidden group hover:bg-white/[0.04] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target size={120} />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <Target className="h-8 w-8" />
                </div>
                <div>
                  <span className="data-precision-mono text-primary text-[10px] block mb-1">STRATEGIC GOAL</span>
                  <h2 className="text-3xl font-black uppercase italic tracking-tight text-white">Our Mission</h2>
                </div>
              </div>
              <p className="text-xl text-white/60 leading-relaxed font-light">
                To digitize Ethiopian youth football, create <span className="text-white font-medium">verified match data</span>, and open real scouting opportunities for young players from every corner of the country.
              </p>
            </div>
            
            <div className="glass-card p-10 border-l-4 border-l-primary/50 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Eye size={120} />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <Eye className="h-8 w-8" />
                </div>
                <div>
                  <span className="data-precision-mono text-primary text-[10px] block mb-1">FUTURE HORIZON</span>
                  <h2 className="text-3xl font-black uppercase italic tracking-tight text-white">Our Vision</h2>
                </div>
              </div>
              <p className="text-xl text-white/60 leading-relaxed font-light">
                To become the <span className="text-white font-medium">trusted digital backbone</span> of Ethiopian youth football — ensuring every talented player gets recognized and connected to bigger opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values — Matrix Density */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--primary)/0.05),transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="data-precision-mono text-primary tracking-[0.4em] font-bold">DNA // PRINCIPLES</span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mt-4">Our Core Values</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {coreValues.map((value, index) => (
              <div 
                key={value.title}
                className="glass-card p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all group border-white/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary text-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-tight">{value.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/70 transition-colors">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story — Editorial Quality */}
      <section className="py-24 bg-secondary/5 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="data-precision-mono text-primary tracking-[0.3em] font-bold">THE JOURNEY</span>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mt-4">Our Story</h2>
            </div>
            
            <div className="glass-card p-10 md:p-16 border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-all duration-1000" />
              <div className="relative z-10 prose prose-invert prose-lg max-w-none prose-p:text-white/60 prose-strong:text-white prose-p:leading-relaxed">
                <p>
                  Founded in 2023 by <strong className="font-black italic">Yonatan Dawit</strong> and <strong className="font-black italic">Ramin Naser</strong>, 
                  Ramiyone was born from a simple observation: Ethiopia has immense football talent, but many young players 
                  lack proper records and opportunities, especially outside major cities.
                </p>
                <p>
                  Starting with the vision to professionalize youth tournaments, we built the <span className="text-primary font-bold">Ethiopian Youth League (EYL)</span>, 
                  an elite digital platform. EYL works seamlessly with our Digital Scouting System (DSS) to turn 
                  match data into permanent, verified player profiles.
                </p>
                <p>
                  Today, EYL helps tournament organizers run their events with <span className="italic">clinical precision</span> while creating lasting value: 
                  academies receive digital credit, players build verifiable career records, and the entire ecosystem 
                  contributes to Ethiopia's national youth development goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Scouting System — High Tech Integration */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <span className="data-precision-mono text-primary tracking-[0.3em] font-bold">ECOSYSTEM // DSS</span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mt-4">Digital Scouting System</h2>
            <p className="text-white/50 max-w-2xl mx-auto mt-6 text-lg">
              A high-density talent identification platform working in perfect synchronization with EYL match data.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dssFeatures.map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card p-8 hover:border-primary/50 hover:bg-white/[0.03] transition-all group border-white/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all border border-primary/20">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-tight">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Process — Stepped Progression */}
      <section className="py-24 bg-secondary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--primary)/0.05),transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="data-precision-mono text-primary tracking-[0.3em] font-bold">ONBOARDING // WORKFLOW</span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mt-4">Registration Process</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {registrationSteps.map((step, index) => (
              <div 
                key={step.title}
                className="glass-card p-8 hover:border-primary/50 hover:bg-white/[0.03] transition-all group relative border-white/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                  0{index + 1}
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-tight">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="glass-card p-8 max-w-3xl mx-auto text-center border-primary/20 bg-primary/5 shadow-[0_0_50px_rgba(0,0,0,0.2)]">
            <p className="text-white/70 text-lg">
              <strong className="text-primary font-black italic">Ramiyone agents</strong> facilitate the entire registration process — from guidance and sessions to issuing <span className="text-white font-bold">Digital IDs</span> that link directly to live player profiles.
            </p>
          </div>
        </div>
      </section>

      {/* Integration — Performance Synced */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="glass-card p-10 md:p-16 border-primary/30 max-w-4xl mx-auto relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-primary/5 pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_40px_hsl(var(--primary)/0.2)] group-hover:shadow-[0_0_60px_hsl(var(--primary)/0.3)] transition-all duration-500">
                  <Handshake className="h-16 w-16 text-primary" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="data-precision-mono text-primary text-[10px] block mb-2 font-black tracking-widest">REAL-TIME DATA SYNC</span>
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-6">Seamless Integration</h2>
                <p className="text-xl text-white/50 leading-relaxed font-light">
                  All academy and player profiles are linked directly with the <span className="text-white font-medium">EYL Tournament Engine</span>. Match stats update automatically, ensuring absolute synchronization across our ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <section className="py-24 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="data-precision-mono text-primary tracking-[0.3em] font-bold">CONNECT // INQUIRIES</span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mt-4">Contact Us</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <a 
              href="mailto:info@ethiopianyouthleague.com"
              className="glass-card p-10 text-center hover:border-primary/50 hover:bg-white/[0.04] transition-all group border-white/5"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white uppercase tracking-tight">Email</h3>
              <p className="text-sm text-white/40">info@ethiopianyouthleague.com</p>
            </a>
            
            <a 
              href="tel:+251911234567"
              className="glass-card p-10 text-center hover:border-primary/50 hover:bg-white/[0.04] transition-all group border-white/5"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white uppercase tracking-tight">Phone</h3>
              <p className="text-sm text-white/40">+251 911 234 567</p>
            </a>
            
            <div className="glass-card p-10 text-center hover:border-primary/50 hover:bg-white/[0.04] transition-all group border-white/5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white uppercase tracking-tight">Location</h3>
              <p className="text-sm text-white/40">Addis Ababa, Ethiopia</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — Command Center Entry */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none">
            Ready to Join the <br /> <span className="text-primary">Movement?</span>
          </h2>
          <p className="text-white/60 mb-12 max-w-2xl mx-auto text-xl font-light">
            Whether you're a player, coach, club, or scout, there's a place for you in the elite EYL ecosystem.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              to="/community" 
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-eyl-gradient text-white font-black uppercase tracking-widest shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.6)] hover:scale-105 transition-all duration-300"
            >
              <Users className="h-6 w-6" />
              Join Our Community
            </Link>
            <Link 
              to="/matches" 
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full border-2 border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/5 transition-all duration-300"
            >
              <Calendar className="h-6 w-6" />
              View Events
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}