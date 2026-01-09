import { Layout } from "@/components/layout/Layout";
import { EYLLogo } from "@/components/EYLLogo";
import { 
  Target, 
  Eye, 
  Heart, 
  Trophy, 
  Users, 
  Calendar, 
  Award,
  Mail,
  Phone,
  MapPin,
  Handshake,
  Star,
  Shield,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const coreValues = [
  {
    icon: Shield,
    title: "Integrity",
    description: "We uphold the highest standards of honesty and transparency in all our operations."
  },
  {
    icon: Users,
    title: "Inclusivity",
    description: "Every young person deserves access to quality football development, regardless of background."
  },
  {
    icon: Star,
    title: "Excellence",
    description: "We strive for the highest standards in player development, coaching, and competition."
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Embracing modern training methods and technology to maximize youth potential."
  },
  {
    icon: Heart,
    title: "Community",
    description: "Building lasting connections between players, families, and local communities."
  }
];

const achievements = [
  { number: "5,000+", label: "Youth Players Developed" },
  { number: "120+", label: "Partner Clubs" },
  { number: "15", label: "Years of Excellence" },
  { number: "50+", label: "Tournaments Organized" },
  { number: "200+", label: "Professional Careers Launched" },
  { number: "12", label: "Regions Covered" }
];

const leadership = [
  {
    name: "Ato Kebede Alemayehu",
    role: "Chairman & Founder",
    bio: "A visionary leader with 25+ years in Ethiopian football development, Ato Kebede founded EYL to create pathways for young talent.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"
  },
  {
    name: "W/ro Tigist Haile",
    role: "Executive Director",
    bio: "Former national team player bringing extensive experience in youth development programs across Africa.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop"
  },
  {
    name: "Ato Dawit Mengistu",
    role: "Technical Director",
    bio: "UEFA Pro Licensed coach dedicated to implementing world-class training methodologies for Ethiopian youth.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop"
  },
  {
    name: "Ato Samuel Tesfaye",
    role: "Head of Operations",
    bio: "Ensuring seamless tournament operations and club coordination across all EYL programs.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop"
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
                Shaping Ethiopia's Football Future
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                About the <span className="text-primary">Ethiopian Youth League</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                The Ethiopian Youth League (EYL) is the premier youth football development organization in Ethiopia, 
                dedicated to nurturing young talent and building the next generation of football stars.
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
                To provide exceptional football development opportunities for Ethiopian youth, fostering talent, 
                discipline, and sportsmanship while creating pathways to professional football careers. We are 
                committed to making quality football training accessible to young people across all regions of Ethiopia.
              </p>
            </div>
            
            <div className="glass-card p-8 border-l-4 border-l-cyan-400">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-cyan-400/10">
                  <Eye className="h-6 w-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To become Africa's leading youth football development program, recognized globally for producing 
                world-class players and fostering a culture of excellence in Ethiopian football. We envision a 
                future where Ethiopian youth football is synonymous with quality, integrity, and success.
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
              These principles guide everything we do at EYL, from training sessions to tournament organization.
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

      {/* History / Story */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground">
                From humble beginnings to Ethiopia's premier youth football organization
              </p>
            </div>
            
            <div className="glass-card p-8 md:p-12">
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  The Ethiopian Youth League was founded in 2011 with a simple yet powerful vision: to give every 
                  young Ethiopian footballer the opportunity to develop their skills and pursue their dreams. What 
                  started as a small tournament in Addis Ababa with just 8 teams has grown into a nationwide 
                  movement spanning 12 regions.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Our founder, Ato Kebede Alemayehu, recognized that while Ethiopia had abundant raw football talent, 
                  there was a critical gap in structured youth development programs. With support from local 
                  communities and passionate volunteers, EYL began its journey to fill this gap.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Over the past 15 years, we have organized more than 50 major tournaments, developed over 5,000 
                  young players, and helped launch more than 200 professional careers. Our alumni now play in 
                  leagues across Africa and Europe, serving as ambassadors for Ethiopian football.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, EYL continues to expand its reach, partnering with international organizations to bring 
                  world-class coaching methodologies to Ethiopian youth while staying true to our roots and values.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Achievements</h2>
            <p className="text-muted-foreground">15 years of impact in numbers</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {achievements.map((stat, index) => (
              <div 
                key={stat.label}
                className="glass-card p-6 text-center hover:border-primary/50 transition-all"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Leadership Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Meet the dedicated professionals driving EYL's mission forward
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader, index) => (
              <div 
                key={leader.name}
                className="glass-card overflow-hidden group hover:border-primary/50 transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={leader.image} 
                    alt={leader.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg">{leader.name}</h3>
                  <p className="text-primary text-sm mb-3">{leader.role}</p>
                  <p className="text-sm text-muted-foreground">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership with Ramyone DSS */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="glass-card p-8 md:p-12 border-primary/30">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Handshake className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-4">Strategic Partnership with Ramyone DSS</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  EYL is proud to partner with Ramyone Digital Sports Solutions (DSS), a leading technology 
                  company specializing in sports management and digital innovation. This partnership brings 
                  cutting-edge technology to Ethiopian youth football, including advanced player tracking, 
                  digital tournament management, and data-driven development programs.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Together, we're building the digital infrastructure that will power the future of Ethiopian 
                  football, making it easier for scouts, coaches, and clubs to discover and develop talent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-secondary/30">
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
              <p className="text-sm text-muted-foreground">Addis Ababa, Ethiopia<br />Bole Sub-City, Woreda 03</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Movement?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're a player, coach, club, or sponsor, there's a place for you in the EYL family.
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