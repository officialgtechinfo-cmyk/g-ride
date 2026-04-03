import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Car, Camera, Upload, Shield, CheckCircle, Loader2, ArrowLeft, ArrowRight, Scan } from "lucide-react";
import { checkAuth, createKycProfile, uploadFile, getMyKycProfile } from "@/lib/api";

type Step = 1 | 2 | 3 | 4 | 5;

export default function KYCRegistration() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    nin: "",
    phone: "",
    role: "",
  });
  const [ninDocument, setNinDocument] = useState<File | null>(null);
  const [ninPreview, setNinPreview] = useState<string>("");
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string>("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = await checkAuth();
      if (!user) {
        navigate("/");
        return;
      }
      const profile = await getMyKycProfile();
      if (profile) {
        toast.info("You already have a KYC profile");
        navigate("/dashboard");
      }
    };
    init();
  }, [navigate]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      toast.error("Unable to access camera. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  const captureSelfie = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setSelfieBlob(blob);
        setSelfiePreview(URL.createObjectURL(blob));
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  }, [stopCamera]);

  const handleNinDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNinDocument(file);
      setNinPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service");
      return;
    }
    setIsSubmitting(true);
    setIsVerifying(true);

    try {
      // Simulate AI verification
      await new Promise((r) => setTimeout(r, 3000));
      const aiScore = Math.floor(Math.random() * 15) + 85; // 85-99%

      // Upload documents
      let ninDocKey = "";
      let selfieKey = "";

      if (ninDocument) {
        ninDocKey = await uploadFile("kyc-documents", ninDocument);
      }
      if (selfieBlob) {
        const selfieFile = new File([selfieBlob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
        selfieKey = await uploadFile("kyc-documents", selfieFile);
      }

      setIsVerifying(false);

      // Create KYC profile
      await createKycProfile({
        full_name: formData.fullName,
        nin: formData.nin,
        phone: formData.phone,
        role: formData.role,
        nin_document_key: ninDocKey,
        selfie_key: selfieKey,
        ai_similarity_score: aiScore,
        status: "PENDING_AI_AUDIT",
        created_at: new Date().toISOString(),
      });

      // Speak confirmation
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("AI Verification complete. Your account is pending admin review.");
        utterance.lang = "en-NG";
        speechSynthesis.speak(utterance);
      }

      toast.success("Registration submitted! Awaiting admin verification.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Please try again.");
      setIsVerifying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.fullName && formData.nin.length === 11 && formData.phone.length === 11;
      case 2: return !!formData.role;
      case 3: return !!ninDocument;
      case 4: return !!selfieBlob;
      case 5: return agreedToTerms;
      default: return false;
    }
  };

  const steps = [
    { num: 1, label: "Identity" },
    { num: 2, label: "Role" },
    { num: 3, label: "NIN Doc" },
    { num: 4, label: "Selfie" },
    { num: 5, label: "Terms" },
  ];

  // AI Verification overlay
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-48 h-48 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-[#D4A843]/30 animate-ping" />
            <div className="absolute inset-4 rounded-full border-2 border-[#D4A843]/50 animate-pulse" />
            <div className="absolute inset-8 rounded-full border border-[#D4A843] animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Scan className="w-16 h-16 text-[#D4A843] animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">G-Ride AI is verifying your identity...</h2>
          <p className="text-gray-400">Comparing your selfie with NIN document</p>
          <div className="mt-6 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-[#D4A843] animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1419] text-white">
      {/* Header */}
      <div className="bg-[#1A2332] border-b border-[#2A3A4A]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-gray-400 hover:text-white hover:bg-[#2A3A4A]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A843] to-[#F0D78C] flex items-center justify-center">
              <Car className="w-4 h-4 text-[#0F1419]" />
            </div>
            <span className="font-bold">G-Ride KYC Registration</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-center">
              <div className={`flex flex-col items-center ${currentStep >= step.num ? "text-[#D4A843]" : "text-gray-600"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  currentStep > step.num ? "bg-[#D4A843] border-[#D4A843] text-[#0F1419]" :
                  currentStep === step.num ? "border-[#D4A843] text-[#D4A843]" : "border-gray-600 text-gray-600"
                }`}>
                  {currentStep > step.num ? <CheckCircle className="w-5 h-5" /> : step.num}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 ${currentStep > step.num ? "bg-[#D4A843]" : "bg-gray-700"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="bg-[#1E2A3A] border-[#2A3A4A]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#D4A843]" />
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Select Your Role"}
              {currentStep === 3 && "Upload NIN Document"}
              {currentStep === 4 && "Live Selfie Capture"}
              {currentStep === 5 && "Terms & Agreement"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Identity */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-300">Full Name (as on NIN)</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="bg-[#0F1419] border-[#2A3A4A] text-white focus:border-[#D4A843]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">NIN (11 digits)</Label>
                  <Input
                    value={formData.nin}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setFormData({ ...formData, nin: v });
                    }}
                    placeholder="Enter 11-digit NIN"
                    className="bg-[#0F1419] border-[#2A3A4A] text-white focus:border-[#D4A843]"
                    maxLength={11}
                  />
                  <p className="text-xs text-gray-500">{formData.nin.length}/11 digits</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Phone Number (11 digits)</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                      setFormData({ ...formData, phone: v });
                    }}
                    placeholder="e.g. 08130969543"
                    className="bg-[#0F1419] border-[#2A3A4A] text-white focus:border-[#D4A843]"
                    maxLength={11}
                  />
                </div>
              </>
            )}

            {/* Step 2: Role */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Label className="text-gray-300">What role are you registering for?</Label>
                <div className="grid gap-4">
                  {[
                    { value: "user", label: "Rider / Customer", desc: "Book rides and send packages", icon: "🚗" },
                    { value: "driver", label: "G-Cab Driver", desc: "Drive and earn with your car", icon: "🚕" },
                    { value: "cycler", label: "G-Courier Cycler", desc: "Deliver packages with your motorcycle", icon: "🏍️" },
                  ].map((role) => (
                    <div
                      key={role.value}
                      onClick={() => setFormData({ ...formData, role: role.value })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.role === role.value
                          ? "border-[#D4A843] bg-[#D4A843]/10"
                          : "border-[#2A3A4A] hover:border-[#D4A843]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{role.icon}</span>
                        <div>
                          <div className="font-bold text-white">{role.label}</div>
                          <div className="text-sm text-gray-400">{role.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: NIN Document */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Upload a clear photo of your NIN Slip or ID Card</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleNinDocUpload}
                  className="hidden"
                />
                {ninPreview ? (
                  <div className="relative">
                    <img src={ninPreview} alt="NIN Document" className="w-full rounded-xl border border-[#2A3A4A] max-h-64 object-contain bg-black" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-2 right-2 border-[#D4A843] text-[#D4A843] hover:bg-[#D4A843]/10 !bg-transparent"
                    >
                      Re-upload
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#2A3A4A] rounded-xl p-12 text-center cursor-pointer hover:border-[#D4A843]/50 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Click to upload NIN document</p>
                    <p className="text-xs text-gray-600 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Live Selfie */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Take a live selfie for facial verification</p>
                <canvas ref={canvasRef} className="hidden" />
                {selfiePreview ? (
                  <div className="relative">
                    <img src={selfiePreview} alt="Selfie" className="w-full rounded-xl border border-[#2A3A4A] max-h-80 object-contain bg-black" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelfieBlob(null);
                        setSelfiePreview("");
                        startCamera();
                      }}
                      className="absolute top-2 right-2 border-[#D4A843] text-[#D4A843] hover:bg-[#D4A843]/10 !bg-transparent"
                    >
                      Retake
                    </Button>
                  </div>
                ) : cameraActive ? (
                  <div className="relative">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl border border-[#D4A843]/50 max-h-80 object-cover bg-black" />
                    <div className="absolute inset-0 border-2 border-[#D4A843]/30 rounded-xl pointer-events-none">
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#D4A843]" />
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#D4A843]" />
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#D4A843]" />
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#D4A843]" />
                    </div>
                    <Button
                      onClick={captureSelfie}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-bold"
                    >
                      <Camera className="w-5 h-5 mr-2" /> Capture
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={startCamera}
                    className="border-2 border-dashed border-[#2A3A4A] rounded-xl p-12 text-center cursor-pointer hover:border-[#D4A843]/50 transition-colors"
                  >
                    <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Click to open camera</p>
                    <p className="text-xs text-gray-600 mt-1">Position your face clearly in frame</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Terms */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="bg-[#0F1419] rounded-xl p-4 max-h-64 overflow-y-auto text-sm text-gray-400 border border-[#2A3A4A]">
                  <h4 className="font-bold text-white mb-2">Terms of Service - G-Ride</h4>
                  <p className="mb-2">By registering on G-Ride, you agree to the following terms:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Your personal data will be processed in accordance with the Nigerian Data Protection Act (NDPA) 2023.</li>
                    <li>All courier services comply with NIPOST Courier Regulation standards.</li>
                    <li>Your NIN and biometric data are used solely for identity verification purposes.</li>
                    <li>G-Ride reserves the right to suspend accounts that violate community guidelines.</li>
                    <li>Drivers and cyclers agree to the 70/30 revenue split (70% partner, 30% platform).</li>
                    <li>All payments are processed through direct PalmPay transfer.</li>
                    <li>Emergency SOS alerts will be sent to G-Ride support for immediate assistance.</li>
                    <li>You consent to receiving communications from G-Ride regarding your account and services.</li>
                  </ul>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    className="border-[#D4A843] data-[state=checked]:bg-[#D4A843] data-[state=checked]:border-[#D4A843]"
                  />
                  <Label htmlFor="terms" className="text-gray-300 text-sm cursor-pointer">
                    I agree to the Terms of Service, NDPA 2023 and NIPOST regulations
                  </Label>
                </div>
                <div className="bg-[#D4A843]/10 border border-[#D4A843]/30 rounded-xl p-4">
                  <h4 className="font-bold text-[#D4A843] mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Name:</div>
                    <div className="text-white">{formData.fullName}</div>
                    <div className="text-gray-400">NIN:</div>
                    <div className="text-white">***{formData.nin.slice(-4)}</div>
                    <div className="text-gray-400">Phone:</div>
                    <div className="text-white">{formData.phone}</div>
                    <div className="text-gray-400">Role:</div>
                    <div className="text-white capitalize">{formData.role}</div>
                    <div className="text-gray-400">Documents:</div>
                    <div className="text-white">{ninDocument ? "✅" : "❌"} NIN | {selfieBlob ? "✅" : "❌"} Selfie</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1) as Step)}
                disabled={currentStep === 1}
                className="border-[#2A3A4A] text-gray-400 hover:text-white hover:bg-[#2A3A4A] !bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              {currentStep < 5 ? (
                <Button
                  onClick={() => setCurrentStep((s) => Math.min(5, s + 1) as Step)}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-bold disabled:opacity-50"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="bg-gradient-to-r from-[#D4A843] to-[#F0D78C] text-[#0F1419] font-bold disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Submit Registration
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Badge className="mt-4 bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/30">
          <Shield className="w-3 h-3 mr-1" /> Your data is protected under NDPA 2023
        </Badge>
      </div>
    </div>
  );
}