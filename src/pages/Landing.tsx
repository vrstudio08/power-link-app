import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-charging.jpg";

const Landing = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
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

  const handleSkip = () => {
    setShowOnboarding(false);
  };

  const handleContinue = () => {
    if (currentCard < cards.length - 1) {
      nextCard();
    } else {
      setShowOnboarding(false);
    }
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        {/* Onboarding Carousel */}
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              How It Works
            </h1>
            <p className="text-muted-foreground text-lg">Get started in three simple steps</p>
          </div>

          {/* Card Display */}
          <div className="mb-12">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentCard * 100}%)` }}
              >
                {cards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} className="w-full flex-shrink-0 px-4">
                      <div className="text-center p-12 rounded-2xl bg-gradient-card backdrop-blur-sm border border-border shadow-card max-w-2xl mx-auto">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="text-3xl font-semibold mb-6">{card.title}</h3>
                        <p className="text-muted-foreground text-lg">{card.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevCard}
              className="rounded-full"
              disabled={currentCard === 0}
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
              disabled={currentCard === cards.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="rounded-full px-8 border-border"
            >
              Skip
            </Button>
            <Button
              onClick={handleContinue}
              className="rounded-full px-8 bg-primary hover:bg-primary/90 shadow-glow-green"
            >
              {currentCard === cards.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            <Link to="/auth?intent=driver">
              <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-primary hover:bg-primary/90 shadow-glow-green hover:shadow-glow-cyan transition-all">
                Find a Charger
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link to="/auth?intent=owner">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                List Your Charger
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
