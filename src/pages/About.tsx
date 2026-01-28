import Layout from "@/components/layout/Layout";
import { Anchor, Users, Calendar, Shield } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Anchor className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">About SeaScape</h1>
            <p className="text-xl text-muted-foreground">
              Egypt's Premier Yacht Booking Platform
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Introduction */}
            <section className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground">
                SeaScape is a premium yacht booking platform dedicated to connecting customers 
                with unforgettable maritime experiences across Egypt's most beautiful coastal 
                destinations. From the crystal-clear waters of Marsa Matruh to the vibrant shores 
                of Alexandria and the serene beaches of the North Coast, we bring luxury yacht 
                experiences within your reach.
              </p>
            </section>

            {/* What We Do */}
            <section>
              <h2 className="text-2xl font-bold mb-6">What We Do</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Booking Management</h3>
                  <p className="text-sm text-muted-foreground">
                    We handle the entire booking process, from browsing available yachts to 
                    confirming your reservation with secure payment options.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Guest Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Our digital check-in system with QR codes ensures smooth boarding 
                    and accurate guest tracking for every trip.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Verified Listings</h3>
                  <p className="text-sm text-muted-foreground">
                    All yachts on our platform are verified to meet quality standards, 
                    ensuring you get exactly what you expect.
                  </p>
                </div>
              </div>
            </section>

            {/* Important Notice */}
            <section className="bg-muted/50 border border-border rounded-xl p-8">
              <h2 className="text-xl font-bold mb-4">Important Information</h2>
              <p className="text-muted-foreground">
                <strong>SeaScape operates as a booking platform only.</strong> We do not own, 
                operate, or maintain any of the yachts listed on our platform. Each yacht is 
                owned and operated by independent operators who are responsible for their 
                vessels, crew, and services. SeaScape facilitates the connection between 
                customers and yacht operators, providing a seamless booking experience.
              </p>
            </section>

            {/* Our Locations */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Our Locations</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Marsa Matruh", "North Coast", "Alexandria", "El Gouna"].map((location) => (
                  <div
                    key={location}
                    className="bg-card border border-border rounded-lg p-4 text-center"
                  >
                    <p className="font-medium">{location}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact CTA */}
            <section className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Set Sail?</h2>
              <p className="text-muted-foreground mb-6">
                Browse our collection of premium yachts and book your next adventure.
              </p>
              <a
                href="/yachts"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Explore Yachts
              </a>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
