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
    description: "Upholding the highest standards of honesty and transparency."
  },
  {
    icon: Users,
    title: "Inclusivity",
    description: "Every young person deserves a chance to show their talent, regardless of location."
  },
  {
    icon: Star,
    title: "Excellence",
    description: "Striving for the highest standards in data management and talent identification."
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Embracing modern technology to maximize football quality and talent discovery."
  },
  {
    icon: Heart,
    title: "Community",
    description: "Building lasting connections between players, academies, and clubs."
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
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Trophy className="h-4 w-4" />
                Digital Tournament Management
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                About the <span className="text-primary">Ethiopian Youth League</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                The Ethiopian Youth League (EYL) is a digital tournament management system under Ramiyone administration, 
                dedicated to the automatic management of football tournaments. It enables hosts to update information, 
                handle operations digitally, and store data securely in collaboration with the Ethiopian Football Federation.
              </p>
            </div>
            <div className="relative">
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <EYLLogo size={180} withGlow />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8 border-l-4 border-l-primary">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To provide a robust data management system that improves the quality of tournaments, ensures equality 
                in data access for football governing bodies, and enhances the overall growth of football through reliable data.
              </p>
            </div>
            
            <div className="glass-card p-8 border-l-4 border-l-cyan-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-cyan-400/10">
                  <Eye className="h-6 w-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To see Ethiopian talents identified from every corner of the country, given the opportunity they deserve, 
                and to witness Ethiopian football grow and shine.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our long-term vision is to become Africa's leading data and talent identification platform, helping 
                players across the continent get their chance to succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at EYL.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {coreValues.map((value, index) => (
              <div 
                key={value.title}
                className="glass-card p-6 text-center hover:border-primary/50 transition-all group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground">
                The journey of Ethiopian Youth League
              </p>
            </div>
            
            <div className="glass-card p-8 md:p-12">
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Founded in 2026, the Ethiopian Youth League began with a powerful vision: to raise the quality of 
                  Ethiopian football and give every young player the opportunity to showcase their talent through data.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Our founders, <strong className="text-foreground">Yonatan Dawit</strong> and <strong className="text-foreground">Ramin Naser</strong>, 
                  recognized Ethiopia's abundant football talent but also the critical gap in opportunities — especially for players outside the capital. 
                  Partnering with the Ethiopian Football Federation, EYL set out to close this gap.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Over the past four years, we developed the Digital Scouting System (DSS), a platform for talent identification. 
                  Through this journey, we discovered the need for better player data management and built EYL to address it.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, Ramiyone has partnered with the Ethiopian Football Federation to provide this digital tournament 
                  management and data handling tool to multiple host organizations, working side by side with DSS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Scouting System */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Digital Scouting System (DSS)</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A platform for talent identification that works side by side with EYL. Discover our talent identification 
              platform and join DSS in different roles. Be part of the future of Ethiopian football.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dssFeatures.map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card p-6 hover:border-primary/50 transition-all group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Process */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Registration Process</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              For Teams and Players
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {registrationSteps.map((step, index) => (
              <div 
                key={step.title}
                className="glass-card p-6 hover:border-primary/50 transition-all group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="glass-card p-6 max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Ramiyone agents</strong> facilitate the entire registration process — from guiding academies, 
              coaches, and players through forms to organizing photo sessions and issuing digital IDs.
            </p>
          </div>
        </div>
      </section>

      {/* Community Initiatives */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Community Initiatives</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Building the future of Ethiopian football together
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {communityInitiatives.map((initiative, index) => (
              <div 
                key={initiative.title}
                className="glass-card p-6 text-center hover:border-primary/50 transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="font-bold mb-2 text-primary">{initiative.title}</h3>
                <p className="text-sm text-muted-foreground">{initiative.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration with EYL */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="glass-card p-8 md:p-12 border-primary/30 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Handshake className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-4">Integration with EYL</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All academy and player profiles are linked with the Ethiopian Youth League (EYL). Tournament stats 
                  update automatically, ensuring seamless synchronization between DSS and EYL.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">Get in touch with the EYL team</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a 
              href="mailto:info@ethiopianyouthleague.com"
              className="glass-card p-6 text-center hover:border-primary/50 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-sm text-muted-foreground">info@ethiopianyouthleague.com</p>
            </a>
            
            <a 
              href="tel:+251911234567"
              className="glass-card p-6 text-center hover:border-primary/50 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Phone className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Phone</h3>
              <p className="text-sm text-muted-foreground">+251 911 234 567</p>
            </a>
            
            <div className="glass-card p-6 text-center hover:border-primary/50 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-bold mb-2">Location</h3>
              <p className="text-sm text-muted-foreground">Addis Ababa, Ethiopia</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Movement?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're a player, coach, club, or scout, there's a place for you in the EYL family.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/community" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Users className="h-5 w-5" />
              Join Our Community
            </Link>
            <Link 
              to="/matches" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <Calendar className="h-5 w-5" />
              View Events
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}