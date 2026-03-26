import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import { useToastStore } from "../../store/toastStore.js";
import { sendOTP, verifyOTP } from "../../features/auth/authApi.js";
import { Lock, Mail, Loader } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, saveToStorage } = useAuthStore();
  const toast = useToastStore();

  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      await sendOTP(email);
      setStep("otp");
      setOtpExpiry(new Date(Date.now() + 5 * 60 * 1000));
      toast.success("OTP sent to your email!");
    } catch (err) {
      console.error("Send OTP Error:", err);
      toast.error(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    setIsLoading(true);
    try {
      const data = await verifyOTP(email, otp);
      login(data.user, data.token);
      saveToStorage(data.user, data.token);
      toast.success("Login successful!");

      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin");
        } else if (data.user.role === "guide") {
          navigate("/guide");
        } else {
          navigate("/student");
        }
      }, 500);
    } catch (err) {
      console.error("Verify OTP Error:", err);
      toast.error(err.response?.data?.error || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-lg mb-4">
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Review Slot Booking</h1>
          <p className="text-slate-300">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8">
          {step === "email" ? (
            <>
              {/* Email Step */}
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>

              {/* Demo Emails */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold">
                  📝 Demo Accounts (OTP-Based Login):
                </p>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => setEmail("hemaswarupbande5@gmail.com")}
                    className="w-full text-left px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    Admin: hemaswarupbande5@gmail.com
                  </button>
                  <button
                    onClick={() => setEmail("tabid3377@gmail.com")}
                    className="w-full text-left px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    Guide: tabid3377@gmail.com
                  </button>
                  <button
                    onClick={() => setEmail("student1@example.com")}
                    className="w-full text-left px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    Student: student1@example.com
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* OTP Step */}
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    OTP sent to <span className="font-semibold">{email}</span>
                  </p>
                  {otpExpiry && (
                    <p className="text-xs text-slate-400 mt-1">
                      Expires in {Math.max(0, Math.ceil((otpExpiry - Date.now()) / 1000))} seconds
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                  }}
                  className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-semibold py-2"
                >
                  Change Email
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-300 mt-6">
          Secured with OTP-based authentication
        </p>
      </div>
    </div>
  );
}
