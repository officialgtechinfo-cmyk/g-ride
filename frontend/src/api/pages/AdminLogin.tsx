import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, Car } from "lucide-react";
import { checkAuth, login } from "@/lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const user = await checkAuth();
      if (user) { navigate("/admin/dashboard"); }
      setIsLoading(false);
    };
    init();
  }, [navigate]);

  if (isLoading) return <div className="min-h-screen bg-[#0F1419] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#D4A843] animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0F1419] flex items-center justify-center p-4">
      <Card className="bg-[#1E2A3A] border-[#2A3A4A] max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A843] to-[#F0D78C] flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-[#0F1419]" />
          </div>
          <CardTitle className="text-white text-2xl">G-Ride Pro Admin</CardTitle>
          <p className="text-gray-400 text-sm">Authorized personnel only</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-xl p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#D4A843] flex-shrink-0" />
            <p className="text-sm text-gray-300">This dashboard is restricted to G-Ride administrators.</p>
          </div>
          <Button onClick={() => login()} className="w-full bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-bold py-6 text-lg">
            Sign In as Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}