import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Car, Users, CreditCard, Shield, CheckCircle, XCircle, Loader2, LogOut, DollarSign, TrendingUp, Bell, Eye } from "lucide-react";
import { checkAuth, logout, getAdminStats, getPendingKyc, getPendingPayments, getAllPayments, getAllRides, activateAccount, suspendAccount, confirmPayment, getFileUrl } from "@/lib/api";

interface Stats { total_users: number; total_rides: number; total_revenue: number; admin_revenue: number; partner_revenue: number; pending_verifications: number; pending_payments: number; }
interface KycItem { id: number; user_id: string; full_name: string; nin: string; phone: string; role: string; nin_document_key: string; selfie_key: string; ai_similarity_score: number; status: string; created_at: string; }
interface PaymentItem { id: number; user_id: string; ride_id: number; amount: number; admin_share: number; partner_share: number; status: string; confirmed_at: string; created_at: string; }
interface RideItem { id: number; user_id: string; mode: string; pickup_state: string; pickup_lga: string; destination_state: string; destination_lga: string; fare: number; status: string; created_at: string; }

export default function AdminDashboard() {
  const navigate = useNavigate();
  const kachingRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ total_users: 0, total_rides: 0, total_revenue: 0, admin_revenue: 0, partner_revenue: 0, pending_verifications: 0, pending_payments: 0 });
  const [pendingKyc, setPendingKyc] = useState<KycItem[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PaymentItem[]>([]);
  const [confirmedPayments, setConfirmedPayments] = useState<PaymentItem[]>([]);
  const [allRides, setAllRides] = useState<RideItem[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [kycImageUrls, setKycImageUrls] = useState<Record<string, string>>({});
  const [goldPulse, setGoldPulse] = useState(false);

  const loadData = useCallback(async () => {
    const user = await checkAuth();
    if (!user) { navigate("/admin"); return; }
    try {
      const [s, kyc, pp, cp, ar] = await Promise.all([getAdminStats(), getPendingKyc(), getPendingPayments(), getAllPayments(), getAllRides()]);
      setStats(s as Stats);
      setPendingKyc(kyc as KycItem[]);
      setPendingPayments(pp as PaymentItem[]);
      setConfirmedPayments(cp as PaymentItem[]);
      setAllRides(ar as RideItem[]);
    } catch (err) { console.error(err); }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh every 15 seconds
  useEffect(() => { const i = setInterval(loadData, 15000); return () => clearInterval(i); }, [loadData]);

  const playKaching = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.setValueAtTime(1600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* ignore audio errors */ }
  };

  const triggerGoldPulse = () => { setGoldPulse(true); setTimeout(() => setGoldPulse(false), 2000); };

  const handleActivate = async (id: number) => {
    setProcessingId(id);
    try {
      await activateAccount(id);
      toast.success("Account activated!");
      if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance("Account activated successfully."); u.lang = "en-NG"; speechSynthesis.speak(u); }
      await loadData();
    } catch (err) { console.error(err); toast.error("Failed to activate."); }
    setProcessingId(null);
  };

  const handleSuspend = async (id: number) => {
    setProcessingId(id);
    try {
      await suspendAccount(id);
      toast.success("Account suspended.");
      await loadData();
    } catch (err) { console.error(err); toast.error("Failed to suspend."); }
    setProcessingId(null);
  };

  const handleConfirmPayment = async (id: number) => {
    setProcessingId(id);
    try {
      await confirmPayment(id);
      playKaching();
      triggerGoldPulse();
      toast.success("Payment confirmed!");
      if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance("Payment confirmed. Ride activated."); u.lang = "en-NG"; speechSynthesis.speak(u); }
      await loadData();
    } catch (err) { console.error(err); toast.error("Failed to confirm."); }
    setProcessingId(null);
  };

  const loadKycImage = async (key: string) => {
    if (!key || kycImageUrls[key]) return;
    try {
      const url = await getFileUrl("kyc-documents", key);
      setKycImageUrls((prev) => ({ ...prev, [key]: url }));
    } catch { /* ignore */ }
  };

  if (isLoading) return <div className="min-h-screen bg-[#0F1419] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#D4A843] animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      <audio ref={kachingRef} />
      <div className="bg-[#1A2332] border-b border-[#2A3A4A] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A843] to-[#F0D78C] flex items-center justify-center"><Car className="w-4 h-4 text-[#0F1419]" /></div>
            <div><span className="font-bold">G-Ride</span><span className="text-[#D4A843] ml-1 text-sm font-medium">PRO ADMIN</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`relative ${stats.pending_verifications > 0 || stats.pending_payments > 0 ? "animate-pulse" : ""}`}>
              <Bell className={`w-5 h-5 ${goldPulse ? "text-[#D4A843]" : "text-gray-400"}`} />
              {(stats.pending_verifications + stats.pending_payments) > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">{stats.pending_verifications + stats.pending_payments}</span>}
            </div>
            <Button variant="ghost" size="icon" onClick={async () => { await logout(); navigate("/admin"); }} className="text-gray-400 hover:text-white hover:bg-[#2A3A4A]"><LogOut className="w-5 h-5" /></Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Users", value: stats.total_users, icon: Users, color: "text-blue-400" },
            { label: "Total Rides", value: stats.total_rides, icon: Car, color: "text-green-400" },
            { label: "Total Revenue", value: `NGN ${stats.total_revenue.toLocaleString()}`, icon: DollarSign, color: "text-[#D4A843]", pulse: goldPulse },
            { label: "Admin Revenue (30%)", value: `NGN ${stats.admin_revenue.toLocaleString()}`, icon: TrendingUp, color: "text-[#D4A843]" },
          ].map((stat) => (
            <Card key={stat.label} className={`bg-[#1E2A3A] border-[#2A3A4A] ${stat.pulse ? "border-[#D4A843] shadow-lg shadow-[#D4A843]/20" : ""} transition-all`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className={`bg-[#1E2A3A] border-[#2A3A4A] ${stats.pending_verifications > 0 && goldPulse ? "border-[#D4A843]" : ""}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-xs text-gray-400">Pending KYC</p><p className="text-2xl font-bold text-yellow-400">{stats.pending_verifications}</p></div>
              <Shield className="w-8 h-8 text-yellow-400/50" />
            </CardContent>
          </Card>
          <Card className={`bg-[#1E2A3A] border-[#2A3A4A] ${stats.pending_payments > 0 && goldPulse ? "border-[#D4A843]" : ""}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div><p className="text-xs text-gray-400">Pending Payments</p><p className="text-2xl font-bold text-yellow-400">{stats.pending_payments}</p></div>
              <CreditCard className="w-8 h-8 text-yellow-400/50" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="kyc" className="space-y-6">
          <TabsList className="bg-[#1A2332] border border-[#2A3A4A] p-1">
            <TabsTrigger value="kyc" className="data-[state=active]:bg-[#D4A843] data-[state=active]:text-[#0F1419]"><Shield className="w-4 h-4 mr-1" /> KYC ({stats.pending_verifications})</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-[#D4A843] data-[state=active]:text-[#0F1419]"><CreditCard className="w-4 h-4 mr-1" /> Payments ({stats.pending_payments})</TabsTrigger>
            <TabsTrigger value="ledger" className="data-[state=active]:bg-[#D4A843] data-[state=active]:text-[#0F1419]"><DollarSign className="w-4 h-4 mr-1" /> Ledger</TabsTrigger>
            <TabsTrigger value="rides" className="data-[state=active]:bg-[#D4A843] data-[state=active]:text-[#0F1419]"><Car className="w-4 h-4 mr-1" /> Rides</TabsTrigger>
          </TabsList>

          <TabsContent value="kyc" className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-[#D4A843]" /> Verification Hub</h3>
            {pendingKyc.length === 0 ? (
              <Card className="bg-[#1E2A3A] border-[#2A3A4A]"><CardContent className="p-8 text-center text-gray-400"><Shield className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No pending verifications.</p></CardContent></Card>
            ) : pendingKyc.map((item) => (
              <Card key={item.id} className="bg-[#1E2A3A] border-[#2A3A4A]">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{item.full_name}</p>
                      <p className="text-sm text-gray-400">NIN: ***{item.nin.slice(-4)} | Phone: {item.phone} | Role: <span className="capitalize">{item.role}</span></p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">PENDING</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-2">NIN Photo</p>
                      <div className="h-32 bg-[#0F1419] rounded-lg border border-[#2A3A4A] flex items-center justify-center overflow-hidden">
                        {item.nin_document_key ? (
                          kycImageUrls[item.nin_document_key] ? <img src={kycImageUrls[item.nin_document_key]} alt="NIN" className="w-full h-full object-cover" /> :
                          <Button variant="ghost" size="sm" onClick={() => loadKycImage(item.nin_document_key)} className="text-[#D4A843]"><Eye className="w-4 h-4 mr-1" /> View</Button>
                        ) : <p className="text-xs text-gray-600">No image</p>}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-2">Live Selfie</p>
                      <div className="h-32 bg-[#0F1419] rounded-lg border border-[#2A3A4A] flex items-center justify-center overflow-hidden">
                        {item.selfie_key ? (
                          kycImageUrls[item.selfie_key] ? <img src={kycImageUrls[item.selfie_key]} alt="Selfie" className="w-full h-full object-cover" /> :
                          <Button variant="ghost" size="sm" onClick={() => loadKycImage(item.selfie_key)} className="text-[#D4A843]"><Eye className="w-4 h-4 mr-1" /> View</Button>
                        ) : <p className="text-xs text-gray-600">No image</p>}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-2">AI Match Score</p>
                      <div className="h-32 bg-[#0F1419] rounded-lg border border-[#2A3A4A] flex items-center justify-center">
                        <div>
                          <p className={`text-4xl font-bold ${(item.ai_similarity_score || 0) >= 80 ? "text-green-400" : "text-red-400"}`}>{item.ai_similarity_score || 0}%</p>
                          <p className="text-xs text-gray-500 mt-1">{(item.ai_similarity_score || 0) >= 80 ? "Match" : "Low Match"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => handleActivate(item.id)} disabled={processingId === item.id} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold">
                      {processingId === item.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />} Activate Account
                    </Button>
                    <Button onClick={() => handleSuspend(item.id)} disabled={processingId === item.id} variant="outline" className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10 !bg-transparent">
                      <XCircle className="w-4 h-4 mr-2" /> Suspend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#D4A843]" /> Pending Payments</h3>
            {pendingPayments.length === 0 ? (
              <Card className="bg-[#1E2A3A] border-[#2A3A4A]"><CardContent className="p-8 text-center text-gray-400"><CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No pending payments.</p></CardContent></Card>
            ) : pendingPayments.map((pay) => (
              <Card key={pay.id} className="bg-[#1E2A3A] border-[#2A3A4A]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg">NGN {pay.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">Ride #{pay.ride_id} | {new Date(pay.created_at).toLocaleString()}</p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400">TRANSFERRED</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="bg-[#0F1419] rounded-lg p-2 border border-[#2A3A4A]"><p className="text-xs text-gray-500">Admin (30%)</p><p className="font-bold text-[#D4A843]">NGN {pay.admin_share.toLocaleString()}</p></div>
                    <div className="bg-[#0F1419] rounded-lg p-2 border border-[#2A3A4A]"><p className="text-xs text-gray-500">Partner (70%)</p><p className="font-bold text-green-400">NGN {pay.partner_share.toLocaleString()}</p></div>
                  </div>
                  <Button onClick={() => handleConfirmPayment(pay.id)} disabled={processingId === pay.id} className="w-full bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-bold">
                    {processingId === pay.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />} Confirm Payment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="ledger" className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#D4A843]" /> Financial Ledger (70/30 Split)</h3>
            <Card className="bg-[#1E2A3A] border-[#2A3A4A]">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-[#0F1419] rounded-lg border border-[#2A3A4A]"><p className="text-xs text-gray-400">Total Revenue</p><p className="text-xl font-bold text-white">NGN {stats.total_revenue.toLocaleString()}</p></div>
                  <div className="text-center p-3 bg-[#0F1419] rounded-lg border border-[#D4A843]/30"><p className="text-xs text-gray-400">Admin (30%)</p><p className="text-xl font-bold text-[#D4A843]">NGN {stats.admin_revenue.toLocaleString()}</p></div>
                  <div className="text-center p-3 bg-[#0F1419] rounded-lg border border-green-500/30"><p className="text-xs text-gray-400">Partners (70%)</p><p className="text-xl font-bold text-green-400">NGN {stats.partner_revenue.toLocaleString()}</p></div>
                </div>
              </CardContent>
            </Card>
            {confirmedPayments.length === 0 ? (
              <Card className="bg-[#1E2A3A] border-[#2A3A4A]"><CardContent className="p-8 text-center text-gray-400"><p>No confirmed payments yet.</p></CardContent></Card>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2 text-xs text-gray-500 px-4">
                  <span>ID</span><span>Amount</span><span>Admin 30%</span><span>Partner 70%</span><span>Date</span>
                </div>
                {confirmedPayments.map((pay) => (
                  <Card key={pay.id} className="bg-[#1E2A3A] border-[#2A3A4A]">
                    <CardContent className="p-3 grid grid-cols-5 gap-2 text-sm items-center">
                      <span className="text-gray-400">#{pay.id}</span>
                      <span className="font-bold">NGN {pay.amount.toLocaleString()}</span>
                      <span className="text-[#D4A843]">NGN {pay.admin_share.toLocaleString()}</span>
                      <span className="text-green-400">NGN {pay.partner_share.toLocaleString()}</span>
                      <span className="text-gray-500 text-xs">{new Date(pay.created_at).toLocaleDateString()}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rides" className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2"><Car className="w-5 h-5 text-[#D4A843]" /> All Rides</h3>
            {allRides.length === 0 ? (
              <Card className="bg-[#1E2A3A] border-[#2A3A4A]"><CardContent className="p-8 text-center text-gray-400"><p>No rides yet.</p></CardContent></Card>
            ) : allRides.map((ride) => (
              <Card key={ride.id} className="bg-[#1E2A3A] border-[#2A3A4A]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">{ride.mode === "G-Cab" ? <Car className="w-4 h-4 text-[#D4A843]" /> : <span className="text-[#D4A843]">M</span>}<span className="font-bold">{ride.mode}</span><span className="text-xs text-gray-500">#{ride.id}</span></div>
                    <Badge className={ride.status === "COMPLETED" || ride.status === "PAYMENT_CONFIRMED" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>{ride.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <div className="text-sm text-gray-400">{ride.pickup_lga}, {ride.pickup_state} → {ride.destination_lga}, {ride.destination_state}</div>
                  <div className="flex justify-between mt-2"><span className="text-[#D4A843] font-bold">NGN {ride.fare.toLocaleString()}</span><span className="text-xs text-gray-500">{new Date(ride.created_at).toLocaleDateString()}</span></div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}