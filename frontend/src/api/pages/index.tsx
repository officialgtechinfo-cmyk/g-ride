import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Bike, Shield, Clock, MapPin, Phone, Mail, ChevronRight, Star, Zap, Users } from "lucide-react";
import { checkAuth, login } from "@/lib/api";

const HERO_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/1033388/2026-03-19/e69bc447-15c5-432e-9f50-9443b096c07f.png";
const COURIER_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/1033388/2026-03-19/1bb18b91-d524-4f3e-9459-68e2f99e8e65.png";
const DRIVER_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/1033388/2026-03-19/055d2285-4960-43b5-ba10-48e5f6dd3983.png";
const CITY_IMG = "https://mgx-backend-cdn.metadl.com/generate/images/1033388/2026-03-19/09429f81-a294-41c3-8f80-6f855cd40a5d.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = await checkAuth();
      setUser(u);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1419] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F1419]/90 backdrop-blur-xl border-b border-[#2A3A4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4A843] to-[#F0D78C] flex items-center justify-center">
              <Car className="w-5 h-5 text-[#0F1419]" />
            </div>
            <span className="text-xl font-bold">
              G-<span className="text-[#D4A843]">Ride</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#services" className="hover:text-[#D4A843] transition-colors">Services</a>
            <a href="#features" className="hover:text-[#D4A843] transition-colors">Features</a>
            <a href="#safety" className="hover:text-[#D4A843] transition-colors">Safety</a>
            <a href="#contact" className="hover:text-[#D4A843] transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && (
              user ? (
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-semibold hover:opacity-90 transition-opacity"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => login()}
                  className="bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-semibold hover:opacity-90 transition-opacity"
                >
                  Sign In
                </Button>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 min-h-screen flex items-center">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="G-Ride Hero" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F1419] via-[#0F1419]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1419] via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <Badge className="bg-[#D4A843]/20 text-[#D4A843] border-[#D4A843]/30 mb-6 text-sm px-4 py-1.5">
              <Zap className="w-3.5 h-3.5 mr-1.5" /> Nigeria's Premium Ride Platform
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A843] to-[#F0D78C]">Comfort</span>
              <br />Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A843] to-[#F0D78C]">Joy</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8 leading-relaxed">
              Experience premium rides and lightning-fast courier delivery across Nigeria.
              AI-verified drivers, real-time tracking, and seamless payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-bold text-lg px-8 py-6 hover:opacity-90 transition-all shadow-lg shadow-[#D4A843]/20 animate-pulse-subtle"
              >
                <Car className="w-5 h-5 mr-2" /> Book G-Cab
              </Button>
              <Button
                onClick={handleGetStarted}
                size="lg"
                variant="outline"
                className="border-[#D4A843] text-[#D4A843] font-bold text-lg px-8 py-6 hover:bg-[#D4A843]/10 !bg-transparent transition-all"
              >
                <Bike className="w-5 h-5 mr-2" /> Send G-Courier
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-10 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#D4A843]" />
                <span>AI Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4A843]" />
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4A843]" />
                <span>All 36 States + FCT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-[#0F1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-[#D4A843]/20 text-[#D4A843] border-[#D4A843]/30 mb-4">Our Services</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Two Modes, One Platform</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Choose between premium car rides or fast motorcycle courier delivery</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-[#1E2A3A] border-[#2A3A4A] overflow-hidden group hover:border-[#D4A843]/50 transition-all duration-500 hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <img src={HERO_IMG} alt="G-Cab" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E2A3A] to-transparent" />
                <Badge className="absolute top-4 left-4 bg-[#D4A843] text-[#0F1419] font-bold">G-Cab</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  <Car className="w-6 h-6 text-[#D4A843]" /> Premium Car Rides
                </h3>
                <p className="text-gray-400 mb-4">Comfortable, air-conditioned rides with AI-verified professional drivers. Available across all 36 states and FCT.</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><Star className="w-4 h-4 text-[#D4A843]" /> Professional verified drivers</li>
                  <li className="flex items-center gap-2"><Star className="w-4 h-4 text-[#D4A843]" /> Real-time GPS tracking</li>
                  <li className="flex items-center gap-2"><Star className="w-4 h-4 text-[#D4A843]" /> SOS emergency support</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-[#1E2A3A] border-[#2A3A4A] overflow-hidden group hover:border-[#D4A843]/50 transition-all duration-500 hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <img src={COURIER_IMG} alt="G-Courier" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E2A3A] to-transparent" />
                <Badge className="absolute top-4 left-4 bg-[#D4A843] text-[#0F1419] font-bold">G-Courier</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                  <Bike className="w-6 h-6 text-[#D4A843]" /> Motorcycle Delivery
                </h3>
                <p className="text-gray-400 mb-4">Lightning-fast package delivery with verified cyclers. Beat the traffic and get your items delivered swiftly.</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><Star className="w-4 h-4 text-[#D4A843]" /> Verified motorcycle riders</li>
                  <li className="flex items-center gap-2"><Star className="w-4 h-4 text-[#D4A843]" /> Express delivery options</li>
                  <li className="flex items-center gap-2"><Star className="w-4 h-4 text-[#D4A843]" /> Package tracking</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#1A2332]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-[#D4A843]/20 text-[#D4A843] border-[#D4A843]/30 mb-4">Why G-Ride</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Built for Nigeria</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Advanced technology meets local expertise</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "AI-Powered KYC", desc: "Facial recognition and NIN verification for all drivers and users" },
              { icon: MapPin, title: "Nigeria-Wide Coverage", desc: "Available across all 36 states and FCT with 774 LGAs" },
              { icon: Zap, title: "Instant Booking", desc: "Book rides and send packages in seconds with our smart interface" },
              { icon: Users, title: "Verified Partners", desc: "Every driver and cycler undergoes rigorous AI identity verification" },
              { icon: Clock, title: "Real-Time Tracking", desc: "Track your ride or package in real-time with GPS navigation" },
              { icon: Phone, title: "24/7 SOS Support", desc: "Emergency button with instant WhatsApp alerts and voice prompts" },
            ].map((feature, i) => (
              <Card key={i} className="bg-[#0F1419] border-[#2A3A4A] p-6 hover:border-[#D4A843]/50 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-[#D4A843]/10 flex items-center justify-center mb-4 group-hover:bg-[#D4A843]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#D4A843]" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Driver Section */}
      <section className="py-24 bg-[#0F1419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#D4A843]/20 text-[#D4A843] border-[#D4A843]/30 mb-4">Become a Partner</Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">Drive & Earn with G-Ride</h2>
              <p className="text-gray-400 text-lg mb-8">Join our network of verified drivers and cyclers. Earn 70% of every trip fare with transparent, direct payments.</p>
              <div className="space-y-4 mb-8">
                {[
                  "70% earnings on every completed trip",
                  "Flexible working hours - drive when you want",
                  "Direct PalmPay settlements - no delays",
                  "AI-powered identity verification for safety",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D4A843]/20 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-[#D4A843]" />
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-bold hover:opacity-90"
              >
                Register as Partner <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border-2 border-[#D4A843]/30">
                <img src={DRIVER_IMG} alt="Professional Driver" className="w-full h-[500px] object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#1E2A3A] border border-[#D4A843]/30 rounded-xl p-4 shadow-xl">
                <div className="text-sm text-gray-400">Average Earnings</div>
                <div className="text-2xl font-bold text-[#D4A843]">₦45,000/day</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="py-24 bg-[#1A2332] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={CITY_IMG} alt="City" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-[#D4A843]/20 text-[#D4A843] border-[#D4A843]/30 mb-4">Safety First</Badge>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Your Safety, Our Priority</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12">
            Every ride is protected with AI verification, real-time tracking, and emergency SOS support
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { title: "AI Verification", desc: "Biometric facial matching against NIN for all users", icon: Shield },
              { title: "Emergency SOS", desc: "One-tap emergency alert with GPS location sharing", icon: Phone },
              { title: "24/7 Monitoring", desc: "Round-the-clock admin monitoring and support", icon: Clock },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#D4A843]/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-[#D4A843]" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0F1419]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Ride?</h2>
          <p className="text-gray-400 text-lg mb-8">Join thousands of Nigerians enjoying premium rides and fast deliveries</p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-bold text-lg px-10 py-6 hover:opacity-90 shadow-lg shadow-[#D4A843]/20"
          >
            Get Started Now <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#1A2332] border-t border-[#2A3A4A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4A843] to-[#F0D78C] flex items-center justify-center">
                  <Car className="w-5 h-5 text-[#0F1419]" />
                </div>
                <span className="text-xl font-bold">G-<span className="text-[#D4A843]">Ride</span></span>
              </div>
              <p className="text-gray-400 text-sm mb-4">Your comfort, our joy. Nigeria's premium ride-hailing and courier platform.</p>
              <p className="text-gray-500 text-xs">Founded by Godspower Kasiemobie Nwachi</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#D4A843]">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>G-Cab (Car Rides)</li>
                <li>G-Courier (Motorcycle Delivery)</li>
                <li>Partner Registration</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#D4A843]">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+2348130969543" className="hover:text-[#D4A843]">+234 813 096 9543</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:officialgtechinfo@gmail.com" className="hover:text-[#D4A843]">officialgtechinfo@gmail.com</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#D4A843]">Social</h4>
              <div className="flex gap-3">
                <a href="https://wa.me/2348130969543" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#0F1419] border border-[#2A3A4A] flex items-center justify-center hover:border-[#D4A843] transition-colors" title="WhatsApp">
                  <svg className="w-5 h-5 text-[#D4A843]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <a href="https://facebook.com/RealGTech" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#0F1419] border border-[#2A3A4A] flex items-center justify-center hover:border-[#D4A843] transition-colors" title="Facebook">
                  <svg className="w-5 h-5 text-[#D4A843]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://x.com/g-ride" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#0F1419] border border-[#2A3A4A] flex items-center justify-center hover:border-[#D4A843] transition-colors" title="X (Twitter)">
                  <svg className="w-5 h-5 text-[#D4A843]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://instagram.com/g-ride" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#0F1419] border border-[#2A3A4A] flex items-center justify-center hover:border-[#D4A843] transition-colors" title="Instagram">
                  <svg className="w-5 h-5 text-[#D4A843]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#2A3A4A] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2026 G-Ride by G-Tech. All rights reserved.</p>
            <p className="text-gray-500 text-xs">Compliant with NDPA 2023 & NIPOST Courier Regulations</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/2348130969543"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        title="Chat on WhatsApp"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  );
}