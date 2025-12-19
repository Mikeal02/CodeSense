import { Shield, Zap, Brain, Lock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Deep understanding of your codebase using advanced language models"
  },
  {
    icon: Zap,
    title: "Instant Insights",
    description: "Get answers in seconds, not hours of manual code reading"
  },
  {
    icon: Shield,
    title: "Interview Ready",
    description: "First-person explanations perfect for technical interviews"
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description: "Your code never leaves your machine or is stored on our servers"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 border-t border-border/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
