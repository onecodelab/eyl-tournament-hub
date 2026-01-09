import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { EYLLogo } from "@/components/EYLLogo";
import { 
  Users, 
  GraduationCap, 
  Heart, 
  Award,
  ClipboardCheck,
  HelpCircle,
  Handshake,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Star,
  Target,
  Calendar,
  ArrowRight,
  Mail,
  Phone,
  Quote
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const youthPrograms = [
  {
    name: "Rising Stars Academy",
    ageGroup: "U-12",
    description: "Foundation program focusing on basic skills, coordination, and love for the game. Perfect for young players taking their first steps in organized football.",
    features: ["Weekly training sessions", "Fun mini-tournaments", "Basic skills development", "Team building activities"]
  },
  {
    name: "Elite Development Program",
    ageGroup: "U-15",
    description: "Intensive training program for talented youth ready to take their game to the next level. Includes tactical education and physical conditioning.",
    features: ["3x weekly training", "Video analysis sessions", "Strength & conditioning", "Competitive league play"]
  },
  {
    name: "Pro Pathway",
    ageGroup: "U-17",
    description: "Advanced program designed to prepare players for professional football. Includes exposure to scouts and professional clubs.",
    features: ["5x weekly training", "Professional coaching staff", "Scout networking events", "Trial opportunities"]
  },
  {
    name: "Senior Development",
    ageGroup: "U-20",
    description: "Final stage before professional football, focusing on mental preparation, advanced tactics, and career management.",
    features: ["Daily training", "Sports psychology", "Contract & career guidance", "International exposure"]
  }
];

const registrationSteps = [
  { step: 1, title: "Online Application", description: "Fill out our online registration form with player details and preferred program." },
  { step: 2, title: "Assessment Tryout", description: "Attend a tryout session where our coaches evaluate skills and potential." },
  { step: 3, title: "Medical Clearance", description: "Provide medical clearance from a certified sports physician." },
  { step: 4, title: "Program Placement", description: "Based on assessment, we place players in the appropriate development tier." },
  { step: 5, title: "Welcome & Orientation", description: "Join orientation sessions to meet coaches, teammates, and learn program expectations." }
];

const successStories = [
  {
    name: "Biruk Getachew",
    achievement: "Signed with Ethiopian Premier League club",
    quote: "EYL gave me the foundation and exposure I needed. The coaches believed in me when no one else did.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"
  },
  {
    name: "Meron Tadesse",
    achievement: "U-17 National Team Captain",
    quote: "The discipline and tactical knowledge I gained at EYL made me ready for the national team challenge.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop"
  },
  {
    name: "Coach Alemitu Bekele",
    achievement: "From EYL player to Head Coach",
    quote: "I grew up in the EYL system, and now I'm giving back by coaching the next generation.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop"
  }
];

const faqs = [
  {
    question: "What age groups does EYL support?",
    answer: "EYL supports players from U-12 through U-20, with specialized programs for each age group. We focus on age-appropriate development that prepares players for the next level."
  },
  {
    question: "How much does it cost to join?",
    answer: "We believe in accessible football. Our programs range from free community sessions to premium elite programs. Scholarships are available for talented players who demonstrate financial need."
  },
  {
    question: "Where are training locations?",
    answer: "We have training facilities across 12 regions in Ethiopia, with major centers in Addis Ababa, Dire Dawa, and Hawassa. Contact us for the nearest location to you."
  },
  {
    question: "What equipment do players need?",
    answer: "Basic equipment includes football boots, shin guards, and appropriate training attire. Elite program players receive official EYL training kits and equipment."
  },
  {
    question: "How do scouts discover players?",
    answer: "We host regular showcase events where professional scouts from Ethiopian and international clubs attend. Top performers are recommended for trials and opportunities."
  },
  {
    question: "Can girls join EYL programs?",
    answer: "Absolutely! We have dedicated girls' programs and mixed-gender community sessions. Women's football development is a key priority for EYL."
  }
];

const communityInitiatives = [
  {
    title: "Football for All",
    description: "Free weekend football sessions in underserved communities, bringing the joy of football to every child.",
    icon: Heart
  },
  {
    title: "Education First",
    description: "Academic support program ensuring our players excel in school as much as on the pitch.",
    icon: GraduationCap
  },
  {
    title: "Health & Wellness",
    description: "Free health screenings and nutrition education for players and their families.",
    icon: Users
  },
  {
    title: "Coach Development",
    description: "Training programs for community volunteers to become certified youth coaches.",
    icon: Award
  }
];

const sponsorshipTiers = [
  {
    name: "Bronze Partner",
    amount: "50,000 ETB+",
    benefits: ["Logo on regional materials", "Tournament acknowledgment", "Community impact report"]
  },
  {
    name: "Silver Partner",
    amount: "150,000 ETB+",
    benefits: ["Logo on national materials", "VIP tournament access", "Player scholarship naming", "Social media features"]
  },
  {
    name: "Gold Partner",
    amount: "500,000 ETB+",
    benefits: ["Title sponsorship opportunities", "Exclusive events access", "Brand ambassador players", "Custom activation programs"]
  }
];

export default function Community() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              Building Champions Together
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Football & <span className="text-primary">Community</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover our youth development programs, join our community initiatives, 
              and be part of Ethiopia's football future.
            </p>
          </div>
        </div>
      </section>

      {/* Youth Development Programs */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Youth Development Programs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Structured pathways designed to develop players from grassroots to professional level
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {youthPrograms.map((program, index) => (
              <div 
                key={program.name}
                className="glass-card p-6 hover:border-primary/50 transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                      {program.ageGroup}
                    </span>
                    <h3 className="text-xl font-bold">{program.name}</h3>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{program.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {program.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How to Join</h2>
            <p className="text-muted-foreground">Your journey to football excellence starts here</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border hidden md:block" />
              
              {registrationSteps.map((step, index) => (
                <div 
                  key={step.step}
                  className="flex gap-6 mb-6 last:mb-0"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative z-10 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {step.step}
                    </div>
                  </div>
                  <div className="glass-card p-5 flex-1">
                    <h3 className="font-bold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Button size="lg" className="gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Start Registration
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Initiatives */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Community Initiatives</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Football is more than a game—it's a tool for positive change in our communities
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityInitiatives.map((initiative, index) => (
              <div 
                key={initiative.title}
                className="glass-card p-6 text-center hover:border-primary/50 transition-all group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <initiative.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{initiative.title}</h3>
                <p className="text-sm text-muted-foreground">{initiative.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground">Hear from those who've walked the EYL path</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <div 
                key={story.name}
                className="glass-card p-6 hover:border-primary/50 transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={story.image} 
                    alt={story.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div>
                    <h3 className="font-bold">{story.name}</h3>
                    <p className="text-sm text-primary">{story.achievement}</p>
                  </div>
                </div>
                <div className="relative">
                  <Quote className="absolute -top-2 -left-1 h-6 w-6 text-primary/20" />
                  <p className="text-muted-foreground italic pl-5">{story.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about EYL</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={faq.question}
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">{faq.question}</span>
                  </div>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground pl-8">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorship */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Sponsorship Opportunities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Partner with EYL and make a lasting impact on Ethiopian youth football
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {sponsorshipTiers.map((tier, index) => (
              <div 
                key={tier.name}
                className={`glass-card p-6 text-center ${index === 2 ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Handshake className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                <p className="text-primary font-medium mb-4">{tier.amount}/year</p>
                <ul className="space-y-2 text-left">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-primary shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="gap-2">
              <Mail className="h-5 w-5" />
              Contact Partnership Team
            </Button>
          </div>
        </div>
      </section>

      {/* Volunteer / Referee */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Become a Volunteer</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Share your passion for football and make a difference in young lives. 
                We're always looking for dedicated volunteers to help with training, 
                events, and community outreach.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  No prior coaching experience required
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Free training and certification provided
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Flexible time commitment
                </div>
              </div>
              <Button className="gap-2">
                Apply as Volunteer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-cyan-400/10">
                  <Award className="h-6 w-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold">Referee Opportunities</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Join our team of match officials and be part of every exciting game. 
                We provide full training and certification for aspiring referees.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Comprehensive referee training program
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Match fees for certified officials
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Pathway to higher-level officiating
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                Join Referee Program
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our team is here to help you get started on your football journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="mailto:join@ethiopianyouthleague.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-5 w-5" />
              join@ethiopianyouthleague.com
            </a>
            <a 
              href="tel:+251911234567"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <Phone className="h-5 w-5" />
              +251 911 234 567
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}