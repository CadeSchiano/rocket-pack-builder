import { TrainingPackCard } from "@/components/TrainingPackCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Zap, X, Filter } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);

  // Fetch training packs from database
  const { data: trainingPacks = [], isLoading } = useQuery({
    queryKey: ["training-packs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_packs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Get unique difficulties and types
  const difficulties = useMemo(
    () => [...new Set(trainingPacks.map((pack) => pack.difficulty))],
    [trainingPacks]
  );
  const types = useMemo(
    () => [...new Set(trainingPacks.map((pack) => pack.type))],
    [trainingPacks]
  );

  // Filter packs based on search and filters
  const filteredPacks = useMemo(() => {
    return trainingPacks.filter((pack) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.code.toLowerCase().includes(searchQuery.toLowerCase());

      // Difficulty filter
      const matchesDifficulty =
        selectedDifficulty.length === 0 ||
        selectedDifficulty.includes(pack.difficulty);

      // Type filter
      const matchesType =
        selectedType.length === 0 || selectedType.includes(pack.type);

      return matchesSearch && matchesDifficulty && matchesType;
    });
  }, [searchQuery, selectedDifficulty, selectedType]);

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulty((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const toggleType = (type: string) => {
    setSelectedType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty([]);
    setSelectedType([]);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedDifficulty.length > 0 ||
    selectedType.length > 0;

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

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, creator, code, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 bg-card border-border text-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filters:
              </div>

              {/* Difficulty Filters */}
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <Badge
                    key={difficulty}
                    variant={
                      selectedDifficulty.includes(difficulty)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => toggleDifficulty(difficulty)}
                  >
                    {difficulty}
                  </Badge>
                ))}
              </div>

              {/* Type Filters */}
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <Badge
                    key={type}
                    variant={
                      selectedType.includes(type) ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-secondary/20 transition-colors border-secondary/50"
                    onClick={() => toggleType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-center text-sm text-muted-foreground">
              Showing {filteredPacks.length} of {trainingPacks.length} training
              packs
            </div>
          </div>

          {/* Training Packs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-muted-foreground">Loading training packs...</p>
              </div>
            ) : filteredPacks.length > 0 ? (
              filteredPacks.map((pack) => (
                <TrainingPackCard key={pack.id} {...pack} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-muted-foreground mb-2">
                  No training packs found
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
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
