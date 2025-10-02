import { TrainingPackCard } from "@/components/TrainingPackCard";
import { Button } from "@/components/ui/button";
import { Search, Zap } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const trainingPacks = [
  {
    name: "Aerial Mastery",
    creator: "SunlessKhan",
    code: "8D93-C997-0C7E-62B4",
    difficulty: "Advanced" as const,
    type: "Aerials",
    description: "Master aerial car control and boost management with progressive difficulty shots",
  },
  {
    name: "Wall-to-Air Dribble",
    creator: "Poquito",
    code: "9F6D-4387-4C57-2E4B",
    difficulty: "Expert" as const,
    type: "Dribbling",
    description: "Learn to carry the ball from the wall into the air and score incredible goals",
  },
  {
    name: "Ground Shots Pro",
    creator: "Wayprotein",
    code: "6EB1-79B2-33B8-681C",
    difficulty: "Intermediate" as const,
    type: "Shooting",
    description: "Improve your ground shot accuracy and power with varied angles and positions",
  },
  {
    name: "Defensive Positioning",
    creator: "Kevpert",
    code: "5A65-4073-F15B-6D87",
    difficulty: "Beginner" as const,
    type: "Defense",
    description: "Practice proper defensive rotations and save positioning fundamentals",
  },
  {
    name: "Flip Reset Fundamentals",
    creator: "CBell",
    code: "3F0D-28C2-7C05-D494",
    difficulty: "Expert" as const,
    type: "Mechanics",
    description: "Master the art of flip resets with controlled practice scenarios",
  },
  {
    name: "Speed Flip Training",
    creator: "Musty",
    code: "A503-264C-A7EB-D282",
    difficulty: "Advanced" as const,
    type: "Mechanics",
    description: "Perfect your speed flip kickoff technique for competitive advantage",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Level Up Your Game</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Rocket League
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mt-2">
                Training Packs
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Master your mechanics with curated training packs from the best players in the community.
              Copy codes and start practicing today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--shadow-glow-blue)]">
                <Search className="mr-2 h-5 w-5" />
                Browse All Packs
              </Button>
              <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                Submit Your Pack
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Training Packs Grid */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Featured Training Packs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hand-picked training packs to help you improve specific skills and rank up faster
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingPacks.map((pack, index) => (
              <TrainingPackCard key={index} {...pack} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            Built for the Rocket League community · Not affiliated with Psyonix
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
