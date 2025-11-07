import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-charging.jpg";

const Landing = () => {
  const [currentCard, setCurrentCard] = useState(0);

  const cards = [
    {
      icon: MapPin,
      title: "Find",
      description: "Locate nearby chargers on our interactive map. Filter by connector type, power output, and price.",
    },
    {
      icon: Zap,
      title: "Charge",
      description: "Book your slot, complete payment, and charge your EV hassle-free at verified locations.",
    },
    {
      icon: Star,
      title: "Review",
      description: "Share your experience and help the community find the best charging spots.",
    },
  ];

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Powering Connections
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Rent and Share EV Chargers Easily
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-primary hover:bg-primary/90 shadow-glow-green hover:shadow-glow-cyan transition-all">
                Find a Charger
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                List Your Charger
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - Swipeable */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          
          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="text-center p-8 rounded-2xl bg-gradient-card backdrop-blur-sm border border-border shadow-card hover:shadow-glow-green transition-all">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{card.title}</h3>
                  <p className="text-muted-foreground">{card.description}</p>
                </div>
              );
            })}
          </div>

          {/* Mobile: Swipeable */}
          <div className="md:hidden relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentCard * 100}%)` }}
              >
                {cards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} className="w-full flex-shrink-0 px-4">
                      <div className="text-center p-8 rounded-2xl bg-gradient-card backdrop-blur-sm border border-border shadow-card">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-4">{card.title}</h3>
                        <p className="text-muted-foreground">{card.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={prevCard}
                className="rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex gap-2">
                {cards.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentCard(idx)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      idx === currentCard ? "bg-primary w-8" : "bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={nextCard}
                className="rounded-full"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;