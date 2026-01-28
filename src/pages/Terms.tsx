import Layout from "@/components/layout/Layout";
import { FileText, AlertTriangle } from "lucide-react";

const Terms = () => {
  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-muted-foreground">
              Please read these terms carefully before using our platform.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: January 2025
            </p>
          </div>

          {/* Content */}
          <div className="max-w-3xl mx-auto">
            {/* Important Notice */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-8">
              <div className="flex gap-4">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-bold text-lg mb-2">Important Notice</h2>
                  <p className="text-sm">
                    By using SeaScape and making a booking, you acknowledge that you have read, 
                    understood, and agree to be bound by these Terms and Conditions. If you do 
                    not agree with any part of these terms, please do not use our services.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms Sections */}
            <div className="space-y-8 text-foreground">
              <section>
                <h2 className="text-xl font-bold mb-4">1. Platform Description</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    SeaScape ("we," "our," or "the Platform") operates as a <strong>booking 
                    platform only</strong>. We provide a digital marketplace that connects 
                    customers with yacht owners and operators for the purpose of booking 
                    maritime experiences.
                  </p>
                  <p>
                    <strong>SeaScape does not own, operate, or maintain any yachts or vessels 
                    listed on this platform.</strong> All yachts are independently owned and 
                    operated by third-party operators.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">2. Limitation of Liability</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <strong>SeaScape expressly disclaims all liability for:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Yacht Condition:</strong> The physical state, maintenance, 
                      cleanliness, or seaworthiness of any vessel listed on our platform.
                    </li>
                    <li>
                      <strong>Operator Behavior:</strong> The conduct, professionalism, 
                      qualifications, or actions of yacht owners, captains, crew members, 
                      or any personnel associated with the yacht.
                    </li>
                    <li>
                      <strong>Accidents & Injuries:</strong> Any physical harm, injury, 
                      illness, or death that may occur before, during, or after a yacht trip.
                    </li>
                    <li>
                      <strong>Property Damage:</strong> Loss, damage, or theft of personal 
                      belongings during the booking experience.
                    </li>
                    <li>
                      <strong>Delays & Cancellations:</strong> Trip delays, cancellations, 
                      or schedule changes caused by weather, mechanical issues, or operator 
                      decisions.
                    </li>
                    <li>
                      <strong>Disputes:</strong> Any disagreements between customers and 
                      yacht operators regarding services, quality, or expectations.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">3. Operator Responsibility</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    All responsibility for the yacht experience lies solely with the yacht 
                    operator. This includes but is not limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Ensuring the vessel is properly maintained and safe for operation</li>
                    <li>Providing qualified and licensed crew members</li>
                    <li>Carrying appropriate insurance coverage</li>
                    <li>Complying with all maritime laws and regulations</li>
                    <li>Providing safety equipment and briefings</li>
                    <li>Delivering the services as described in their listing</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">4. User Responsibilities</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>By using SeaScape, you agree to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate and complete booking information</li>
                    <li>Arrive on time for your scheduled trip</li>
                    <li>Follow all safety instructions provided by the yacht crew</li>
                    <li>Respect the yacht property and other guests</li>
                    <li>Not exceed the stated guest capacity</li>
                    <li>Assume personal risk associated with maritime activities</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">5. Booking & Payment</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    All bookings are subject to availability and operator confirmation. 
                    Payment processing is handled securely through our platform. A 5% 
                    platform fee is added to all bookings to cover operational costs.
                  </p>
                  <p>
                    Refund policies are as stated in our cancellation policy. SeaScape 
                    reserves the right to withhold refunds in cases of policy violations 
                    or fraudulent activity.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">6. QR Code & Check-in</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Each confirmed booking generates a unique QR code for check-in purposes. 
                    This code is single-use and becomes invalid after scanning. Sharing or 
                    duplicating QR codes for fraudulent purposes is strictly prohibited and 
                    may result in booking cancellation without refund.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">7. Indemnification</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    You agree to indemnify and hold harmless SeaScape, its owners, employees, 
                    and affiliates from any claims, damages, losses, or expenses arising from 
                    your use of the platform or participation in yacht experiences booked 
                    through our service.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">8. Governing Law</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    These Terms and Conditions are governed by the laws of the Arab Republic 
                    of Egypt. Any disputes arising from the use of this platform shall be 
                    subject to the exclusive jurisdiction of the Egyptian courts.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">9. Changes to Terms</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    SeaScape reserves the right to modify these Terms and Conditions at any 
                    time. Continued use of the platform after changes constitutes acceptance 
                    of the updated terms.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">10. Contact Information</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    For questions about these Terms and Conditions, please contact us:
                  </p>
                  <ul className="list-none space-y-1">
                    <li><strong>Email:</strong> seascape.eg@gmail.com</li>
                    <li><strong>Phone:</strong> +20 1093610909</li>
                    <li><strong>Location:</strong> Alexandria, Egypt</li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Agreement Statement */}
            <div className="mt-12 p-6 bg-muted/50 border border-border rounded-xl text-center">
              <p className="text-sm text-muted-foreground">
                By proceeding with a booking on SeaScape, you confirm that you have read, 
                understood, and agree to these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
