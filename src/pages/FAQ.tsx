import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Mail, Phone } from "lucide-react";

const faqData = [
  {
    category: "Booking Process",
    questions: [
      {
        question: "How do I book a yacht?",
        answer:
          "Booking is simple! Browse our yacht listings, select your preferred yacht, choose your date and time slot, specify the number of guests, and complete your booking with either online payment or cash on arrival. You'll receive a confirmation email with your QR code.",
      },
      {
        question: "What payment methods are accepted?",
        answer:
          "We accept online payments through secure payment gateways as well as cash payments on the day of your trip. For cash payments, please arrive at least 30 minutes before your scheduled departure time.",
      },
      {
        question: "Can I book for someone else?",
        answer:
          "Yes, you can book on behalf of others. Just ensure the booking details match the primary guest's information, and share the QR code confirmation with them for check-in.",
      },
    ],
  },
  {
    category: "Guest Information",
    questions: [
      {
        question: "How many guests can I bring?",
        answer:
          "Guest capacity varies by yacht. Each listing clearly displays its maximum capacity. For safety reasons, this limit cannot be exceeded. Please check the yacht details before booking to ensure it accommodates your group size.",
      },
      {
        question: "Are children allowed on board?",
        answer:
          "Yes, children are welcome on most yachts. Children count toward the total guest capacity. Life jackets for all sizes are provided on board. We recommend informing the operator about children under 12 for additional safety preparations.",
      },
      {
        question: "Can I bring food and drinks?",
        answer:
          "Policies vary by yacht. Some yachts offer catering services while others allow you to bring your own food and beverages. Check the yacht's 'Included' section or contact us for specific information about your chosen yacht.",
      },
    ],
  },
  {
    category: "Cancellation & Changes",
    questions: [
      {
        question: "What is the cancellation policy?",
        answer:
          "You can cancel your booking up to 24 hours before the scheduled trip for a full refund. Cancellations within 24 hours may be subject to a cancellation fee. In case of severe weather conditions, trips may be rescheduled at no extra cost.",
      },
      {
        question: "Can I modify my booking?",
        answer:
          "Date and time changes are subject to availability. Contact us at least 48 hours before your trip to request changes. Changes to guest count can be made up to 24 hours before departure, subject to yacht capacity.",
      },
      {
        question: "What happens if the weather is bad?",
        answer:
          "Safety is our priority. If weather conditions are deemed unsafe by the yacht operator, your trip will be rescheduled to a mutually convenient date at no additional cost. You'll be notified as soon as possible.",
      },
    ],
  },
  {
    category: "QR Code & Check-in",
    questions: [
      {
        question: "How does the QR code work?",
        answer:
          "After booking, you'll receive a unique QR code via email. Present this code at check-in on the day of your trip. Our staff will scan it to verify your booking and mark you as boarded. The QR code is single-use and becomes invalid after scanning.",
      },
      {
        question: "What if I lose my QR code?",
        answer:
          "No worries! You can find your QR code in your booking confirmation email or by logging into your account and viewing your bookings. You can also show your booking reference number as an alternative.",
      },
      {
        question: "When should I arrive for check-in?",
        answer:
          "We recommend arriving at least 30 minutes before your scheduled departure time. This allows time for check-in, safety briefing, and boarding. Late arrivals may result in reduced trip time.",
      },
    ],
  },
  {
    category: "Support",
    questions: [
      {
        question: "How can I contact support?",
        answer:
          "You can reach our support team via email at seascape.eg@gmail.com or by phone at +20 1093610909. We're available daily from 9 AM to 9 PM to assist you with any questions or concerns.",
      },
      {
        question: "What should I do in case of emergency?",
        answer:
          "In case of any emergency during your trip, immediately alert the yacht crew who are trained in safety procedures. All yachts are equipped with safety equipment and communication devices. For pre-trip emergencies, contact our support line.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">
              Find answers to common questions about booking, payments, and your yacht experience.
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="max-w-3xl mx-auto space-y-8">
            {faqData.map((section) => (
              <div key={section.category}>
                <h2 className="text-xl font-semibold mb-4 text-primary">
                  {section.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {section.questions.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`${section.category}-${index}`}
                      className="bg-card border border-border rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <h2 className="text-xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help you with any questions not covered above.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:seascape.eg@gmail.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Email Us
                </a>
                <a
                  href="tel:+201093610909"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border bg-background font-medium rounded-lg hover:bg-muted transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
