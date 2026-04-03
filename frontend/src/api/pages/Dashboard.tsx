import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Car, Bike, MapPin, LogOut, AlertTriangle, Clock, Loader2, CreditCard, History, User, Shield } from "lucide-react";
import { checkAuth, logout, getMyKycProfile, createRide, getMyRides, createPayment, getMyPayments } from "@/lib/api";
import { getStates, getLGAs, calculateFare } from "@/lib/nigeria-data";

interface KycProfile { id: number; full_name: string; role: string; status: string; phone: string; nin: string; }
interface Ride { id: number; mode: string; pickup_state: string; pickup_lga: string; pickup_street: string; destination_state: string; destination_lga: string; destination_street: string; fare: number; status: string; created_at: string; }
interface Payment { id: number; ride_id: number; amount: number; status: string; created_at: string; }

export default function Dashboard() {
  const navigate = useNavigate();
  const [kycProfile, setKycProfile] = useState<KycProfile | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<"G-Cab" | "G-Courier">("G-Cab");
  const [pickupState, setPickupState] = useState("");
  const [pickupLga, setPickupLga] = useState("");
  const [pickupStreet, setPickupStreet] = useState("");
  const [destState, setDestState] = useState("");
  const [destLga, setDestLga] = useState("");
  const [destStreet, setDestStreet] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [payingRide, setPayingRide] = useState<Ride | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "transferring" | "awaiting">("idle");

  const loadData = useCallback(async () => {
    const u = await checkAuth();
    if (!u) { navigate("/"); return; }
    const profile = await getMyKycProfile();
    setKycProfile(profile as KycProfile | null);
    const r = await getMyRides();
    setRides(r as Ride[]);
    const p = await getMyPayments();
    setPayments(p as Payment[]);
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleBook = async () => {
    if (!pickupState || !pickupLga || !pickupStreet || !destState || !destLga || !destStreet) {
      toast.error("Please fill in all location fields"); return;
    }
    setIsBooking(true);
    try {
      const fare = calculateFare(mode);
      const ride = await createRide({ mode, pickup_state: pickupState, pickup_lga: pickupLga, pickup_street: pickupStreet, destination_state: destState, destination_lga: destLga, destination_street: destStreet, fare, status: "AWAITING_PAYMENT", created_at: new Date().toISOString() });
      toast.success(`${mode} booked! Fare: NGN ${fare.toLocaleString()}`);
      setPayingRide(ride as Ride);
      setPaymentStatus("idle");
      setPickupState(""); setPickupLga(""); setPickupStreet(""); setDestState(""); setDestLga(""); setDestStreet("");
      await loadData();
    } catch (err) { console.error(err); toast.error("Booking failed."); } finally { setIsBooking(false); }
  };

  const handleTransferred = async () => {
    if (!payingRide) return;
    setPaymentStatus("transferring");
    try {
      const amount = payingRide.fare;
      await createPayment({ ride_id: payingRide.id, amount, admin_share: Math.round(amount * 0.3), partner_share: amount - Math.round(amount * 0.3), status: "TRANSFERRED", created_at: new Date().toISOString() });
      setPaymentStatus("awaiting");
      if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance("Payment notification sent. Awaiting admin confirmation."); u.lang = "en-NG"; speechSynthesis.speak(u); }
      toast.success("Payment notification sent to admin!");
      await loadData();
    } catch (err) { console.error(err); toast.error("Failed to submit payment."); setPaymentStatus("idle"); }
  };

  const handleSOS = () => {
    const msg = encodeURIComponent(`SOS EMERGENCY from G-Ride!\nName: ${kycProfile?.full_name || "Unknown"}\nPhone: ${kycProfile?.phone || "Unknown"}\nTime: ${new Date().toLocaleString()}`);
    window.open(`https://wa.me/2348130969543?text=${msg}`, "_blank");
    if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance("SOS Alert sent. Help is on the way."); u.lang = "en-NG"; speechSynthesis.speak(u); }
  };

  if (isLoading) return <div className="min-h-screen bg-[#0F1419] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#D4A843] animate-spin" /></div>;

  if (!kycProfile) return (
    <div className="min-h-screen bg-[#0F1419] flex items-center justify-center text-white">
      <Card className="bg-[#1E2A3A] border-[#2A3A4A] max-w-md w-full mx-4">
        <CardContent className="p-8 text-center">
          <Shield className="w-16 h-16 text-[#D4A843] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">KYC Required</h2>
          <p className="text-gray-400 mb-6">Complete identity verification to use G-Ride</p>
          <Button onClick={() => navigate("/kyc")} className="w-full bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-bold">Complete KYC</Button>
        </CardContent>
      </Card>
    </div>
  );

  const isPending = kycProfile.status === "PENDING_AI_AUDIT";
  const isSuspended = kycProfile.status === "SUSPENDED";
  const states = getStates();

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <div className="bg-[#1A2332] border-b border-[#2A3A4A] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A843] to-[#F0D78C] flex items-center justify-center"><Car className="w-4 h-4 text-[#0F1419]" /></div>
            <span className="font-bold">G-<span className="text-[#D4A843]">Ride</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={kycProfile.status === "ACTIVE" ? "bg-green-500/20 text-green-400 border-green-500/30" : isPending ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
              {kycProfile.status === "ACTIVE" ? "Verified" : isPending ? "Pending" : "Suspended"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={async () => { await logout(); navigate("/"); }} className="text-gray-400 hover:text-white hover:bg-[#2A3A4A]"><LogOut className="w-5 h-5" /></Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {isPending && <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center gap-3"><Clock className="w-5 h-5 text-yellow-400 flex-shrink-0" /><div><p className="font-bold text-yellow-400">Account Pending Verification</p><p className="text-sm text-gray-400">Your KYC is under admin review.</p></div></div>}
        {isSuspended && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" /><div><p className="font-bold text-red-400">Account Suspended</p><p className="text-sm text-gray-400">Contact officialgtechinfo@gmail.com</p></div></div>}

        <Tabs defaultValue="book" className="space-y-6">
          <TabsList className="bg-[#1A2332] border border-[#2A3A4A] p-1">
            <TabsTrigger value="book" className="data-[state=active]:bg-[#D4A843] data-[state=active]:text-[#0F1419]"><MapPin className="w-4 h-4 mr-1" /> Book</TabsTrigger>
            <TabsTrigger value="rides" className="data-[state=active]:bg-[#D4A843] data-[state=active]:text-[#0F1419]"><History className="w-4 h-4 mr-1" /> Rides</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-[#D4A843] data-[state=active]:text-[#0F1419]"><CreditCard className="w-4 h-4 mr-1" /> Pay</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#D4A843] data-[state=active]:text-[#0F1419]"><User className="w-4 h-4 mr-1" /> Me</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-6">
            {payingRide && (
              <Card className="bg-[#1E2A3A] border-[#D4A843]/50 border-2">
                <CardHeader><CardTitle className="text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#D4A843]" /> Payment Required</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-[#0F1419] rounded-xl p-4 border border-[#2A3A4A]">
                    <div className="text-center mb-4"><p className="text-3xl font-bold text-[#D4A843]">NGN {payingRide.fare.toLocaleString()}</p><p className="text-sm text-gray-400">{payingRide.mode} Fare</p></div>
                    <div className="border-t border-[#2A3A4A] pt-4 space-y-2 text-sm">
                      <p className="text-gray-400">Transfer to:</p>
                      <div className="bg-[#D4A843]/10 rounded-lg p-3 border border-[#D4A843]/30">
                        <p className="font-bold text-[#D4A843]">PalmPay</p>
                        <p className="text-white text-lg font-mono">8135008991</p>
                        <p className="text-gray-300">Godspower Kasiemobie Nwachi</p>
                      </div>
                    </div>
                  </div>
                  {paymentStatus === "idle" && <Button onClick={handleTransferred} className="w-full bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-bold py-6 text-lg animate-pulse">I Have Transferred</Button>}
                  {paymentStatus === "transferring" && <Button disabled className="w-full bg-[#2A3A4A] text-gray-400 py-6"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</Button>}
                  {paymentStatus === "awaiting" && <div className="text-center space-y-3"><div className="flex items-center justify-center gap-2 text-yellow-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="font-bold">Awaiting Admin Confirmation...</span></div><Button variant="outline" size="sm" onClick={() => { setPayingRide(null); setPaymentStatus("idle"); }} className="border-[#2A3A4A] text-gray-400 !bg-transparent">Close</Button></div>}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              {(["G-Cab", "G-Courier"] as const).map((m) => (
                <div key={m} onClick={() => setMode(m)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${mode === m ? "border-[#D4A843] bg-[#D4A843]/10" : "border-[#2A3A4A] hover:border-[#D4A843]/50"}`}>
                  {m === "G-Cab" ? <Car className={`w-8 h-8 mx-auto mb-2 ${mode === m ? "text-[#D4A843]" : "text-gray-500"}`} /> : <Bike className={`w-8 h-8 mx-auto mb-2 ${mode === m ? "text-[#D4A843]" : "text-gray-500"}`} />}
                  <p className="font-bold">{m}</p>
                  <p className="text-xs text-gray-400">{m === "G-Cab" ? "Car Ride" : "Motorcycle Delivery"}</p>
                </div>
              ))}
            </div>

            {[{ label: "Pickup Location", color: "bg-green-500", state: pickupState, setState: setPickupState, lga: pickupLga, setLga: setPickupLga, street: pickupStreet, setStreet: setPickupStreet },
              { label: "Destination", color: "bg-red-500", state: destState, setState: setDestState, lga: destLga, setLga: setDestLga, street: destStreet, setStreet: setDestStreet }
            ].map((loc) => (
              <Card key={loc.label} className="bg-[#1E2A3A] border-[#2A3A4A]">
                <CardHeader><CardTitle className="text-white text-lg flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${loc.color}`} /> {loc.label}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div><Label className="text-gray-400 text-xs">State</Label>
                    <Select value={loc.state} onValueChange={(v) => { loc.setState(v); loc.setLga(""); }}>
                      <SelectTrigger className="bg-[#0F1419] border-[#2A3A4A] text-white"><SelectValue placeholder="Select State" /></SelectTrigger>
                      <SelectContent className="bg-[#1E2A3A] border-[#2A3A4A]">{states.map((s) => <SelectItem key={s} value={s} className="text-white hover:bg-[#2A3A4A]">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-gray-400 text-xs">LGA</Label>
                    <Select value={loc.lga} onValueChange={loc.setLga} disabled={!loc.state}>
                      <SelectTrigger className="bg-[#0F1419] border-[#2A3A4A] text-white"><SelectValue placeholder="Select LGA" /></SelectTrigger>
                      <SelectContent className="bg-[#1E2A3A] border-[#2A3A4A] max-h-48">{getLGAs(loc.state).map((l) => <SelectItem key={l} value={l} className="text-white hover:bg-[#2A3A4A]">{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-gray-400 text-xs">Street Address</Label>
                    <Input value={loc.street} onChange={(e) => loc.setStreet(e.target.value)} placeholder="Enter street address" className="bg-[#0F1419] border-[#2A3A4A] text-white focus:border-[#D4A843]" />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={handleBook} disabled={isBooking || isPending || isSuspended} size="lg" className="w-full bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-bold text-lg py-6 disabled:opacity-50 shadow-lg shadow-[#D4A843]/20">
              {isBooking ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : mode === "G-Cab" ? <Car className="w-5 h-5 mr-2" /> : <Bike className="w-5 h-5 mr-2" />}
              {mode === "G-Cab" ? "Book G-Cab" : "Send G-Courier"}
            </Button>
          </TabsContent>

          <TabsContent value="rides" className="space-y-4">
            <h3 className="text-lg font-bold">Ride History</h3>
            {rides.length === 0 ? (
              <Card className="bg-[#1E2A3A] border-[#2A3A4A]"><CardContent className="p-8 text-center text-gray-400"><History className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No rides yet.</p></CardContent></Card>
            ) : rides.map((ride) => (
              <Card key={ride.id} className="bg-[#1E2A3A] border-[#2A3A4A]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">{ride.mode === "G-Cab" ? <Car className="w-4 h-4 text-[#D4A843]" /> : <Bike className="w-4 h-4 text-[#D4A843]" />}<span className="font-bold">{ride.mode}</span></div>
                    <Badge className={ride.status === "PAYMENT_CONFIRMED" || ride.status === "COMPLETED" ? "bg-green-500/20 text-green-400" : ride.status === "AWAITING_PAYMENT" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}>{ride.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-gray-400"><div className="w-2 h-2 rounded-full bg-green-500" />{ride.pickup_street}, {ride.pickup_lga}, {ride.pickup_state}</div>
                    <div className="flex items-center gap-2 text-gray-400"><div className="w-2 h-2 rounded-full bg-red-500" />{ride.destination_street}, {ride.destination_lga}, {ride.destination_state}</div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2A3A4A]">
                    <span className="text-[#D4A843] font-bold">NGN {ride.fare.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">{new Date(ride.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <h3 className="text-lg font-bold">Payment History</h3>
            {payments.length === 0 ? (
              <Card className="bg-[#1E2A3A] border-[#2A3A4A]"><CardContent className="p-8 text-center text-gray-400"><CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No payments yet.</p></CardContent></Card>
            ) : payments.map((pay) => (
              <Card key={pay.id} className="bg-[#1E2A3A] border-[#2A3A4A]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold">NGN {pay.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Ride #{pay.ride_id} - {new Date(pay.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge className={pay.status === "CONFIRMED" ? "bg-green-500/20 text-green-400" : pay.status === "TRANSFERRED" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}>{pay.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-[#1E2A3A] border-[#2A3A4A]">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><User className="w-5 h-5 text-[#D4A843]" /> Profile</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-gray-400">Name:</div><div className="text-white font-medium">{kycProfile.full_name}</div>
                  <div className="text-gray-400">NIN:</div><div className="text-white font-medium">***{kycProfile.nin.slice(-4)}</div>
                  <div className="text-gray-400">Phone:</div><div className="text-white font-medium">{kycProfile.phone}</div>
                  <div className="text-gray-400">Role:</div><div className="text-white font-medium capitalize">{kycProfile.role}</div>
                  <div className="text-gray-400">Status:</div><div><Badge className={kycProfile.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>{kycProfile.status}</Badge></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* SOS Button */}
      <button onClick={handleSOS} className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors animate-pulse" title="Emergency SOS">
        <AlertTriangle className="w-7 h-7 text-white" />
      </button>

      {/* WhatsApp */}
      <a href="https://wa.me/2348130969543" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform" title="WhatsApp Support">
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </div>
  );
}