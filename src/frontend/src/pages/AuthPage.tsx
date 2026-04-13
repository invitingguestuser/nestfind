import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useAuth } from "../hooks/useAuth";
import { useCurrentUser, useRegisterUser } from "../hooks/useUser";

type Step = "choose" | "register";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const registerUser = useRegisterUser();

  const [step, setStep] = useState<Step>("choose");
  const [role, setRole] = useState<UserRole>(UserRole.buyer);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Once authenticated, either redirect or proceed to registration
  useEffect(() => {
    if (isAuthenticated && !userLoading) {
      if (currentUser) {
        navigate({ to: "/" });
      } else {
        setStep("register");
      }
    }
  }, [isAuthenticated, currentUser, userLoading, navigate]);

  async function handleLogin() {
    setIsSigningIn(true);
    try {
      await login();
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    try {
      await registerUser.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        avatarUrl: "",
      });
      toast.success("Welcome to NestFind!");
      navigate({ to: "/" });
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  }

  const isLoading = authLoading || userLoading || isSigningIn;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — brand hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-foreground" />
          <div className="absolute -bottom-32 -right-12 w-80 h-80 rounded-full bg-primary-foreground" />
        </div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary-foreground" />
            <span className="font-display text-2xl font-bold text-primary-foreground">
              NestFind
            </span>
          </Link>
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="font-display text-4xl font-bold text-primary-foreground leading-tight">
            Find your perfect home with confidence
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Thousands of verified listings, trusted agents, and smart tools to
            guide your journey.
          </p>
          <div className="flex flex-col gap-3 pt-4">
            {[
              "Verified listings with freshness badges",
              "AI-powered natural language search",
              "Save, compare, and shortlist properties",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary-foreground/70 flex-shrink-0" />
                <span className="text-primary-foreground/90 text-sm">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-primary-foreground/50 text-xs">
          © {new Date().getFullYear()} NestFind. All rights reserved.
        </p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-primary" />
              <span className="font-display text-xl font-bold text-foreground">
                NestFind
              </span>
            </Link>
          </div>

          {step === "choose" && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Welcome back
                </h1>
                <p className="text-muted-foreground">
                  Sign in with Internet Identity to continue
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <Button
                  size="lg"
                  className="w-full font-semibold"
                  onClick={handleLogin}
                  disabled={isLoading}
                  data-ocid="auth-ii-login-btn"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 mr-2" />
                  )}
                  {isLoading
                    ? "Connecting…"
                    : "Continue with Internet Identity"}
                </Button>

                <Separator />

                <div className="space-y-2 text-sm text-muted-foreground text-center">
                  <p>
                    New to NestFind?{" "}
                    <span className="text-foreground font-medium">
                      You'll be guided to create your account after login.
                    </span>
                  </p>
                  <p className="text-xs">
                    Forgot your passkey?{" "}
                    <a
                      href="https://identity.ic0.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-foreground transition-colors"
                    >
                      Recover via Internet Identity ↗
                    </a>
                  </p>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <span className="underline underline-offset-2 cursor-pointer hover:text-foreground">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="underline underline-offset-2 cursor-pointer hover:text-foreground">
                  Privacy Policy
                </span>
                .
              </p>
            </div>
          )}

          {step === "register" && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Create your profile
                </h1>
                <p className="text-muted-foreground">
                  Tell us a bit about yourself to get started
                </p>
              </div>

              <form
                onSubmit={handleRegister}
                className="bg-card border border-border rounded-xl p-6 space-y-5"
              >
                {/* Role selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">I am a…</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: UserRole.buyer, label: "Buyer / Renter" },
                      { value: UserRole.agent, label: "Agent / Owner" },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value)}
                        data-ocid={`auth-role-${value}`}
                        className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                          role === value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full name *</Label>
                  <Input
                    id="name"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-ocid="auth-name-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-ocid="auth-email-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-ocid="auth-phone-input"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold"
                  disabled={registerUser.isPending}
                  data-ocid="auth-register-submit-btn"
                >
                  {registerUser.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {registerUser.isPending
                    ? "Creating account…"
                    : "Create account"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
