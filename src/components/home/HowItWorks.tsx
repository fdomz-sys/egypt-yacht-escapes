import { useLanguage } from "@/contexts/LanguageContext";
import { Search, CalendarCheck, Anchor } from "lucide-react";

const steps = [
  {
    icon: Search,
    titleKey: "how.step1.title",
    descKey: "how.step1.desc",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: CalendarCheck,
    titleKey: "how.step2.title",
    descKey: "how.step2.desc",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Anchor,
    titleKey: "how.step3.title",
    descKey: "how.step3.desc",
    color: "bg-coral/10 text-coral",
  },
];

const HowItWorks = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("how.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-border">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              )}

              {/* Step Number */}
              <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 rounded-full bg-card border-2 border-border group-hover:border-primary transition-colors duration-300 mb-6">
                <div className={`p-4 rounded-full ${step.color}`}>
                  <step.icon className="h-8 w-8" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-2">{t(step.titleKey)}</h3>
              <p className="text-muted-foreground">{t(step.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
