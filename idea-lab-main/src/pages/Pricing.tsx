import { useState } from "react";
import { Check, Zap, Crown, Building2, Sparkles, Ticket, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayments } from "@/hooks/usePayments";
import { useSubscription } from "@/hooks/useSubscription";
import { NeeshLogo } from "@/components/NeeshLogo";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/lib/api";

const PRO_PRICE = 9.99; // USD

const Pricing = () => {
  const { handleCheckout, isLoading } = usePayments();
  const { subscription, isPro, isEnterprise } = useSubscription();
  const navigate = useNavigate();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountPercentage: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const currentPlan = subscription?.plan || "FREE";

  // Calculate discounted price
  const discountedPrice = couponApplied
    ? Math.max(0.01, PRO_PRICE * (1 - couponApplied.discountPercentage / 100))
    : PRO_PRICE;
  const savings = PRO_PRICE - discountedPrice;

  // Validate coupon
  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const result = await apiClient.post<{ valid: boolean; discountPercentage: number; message: string }>(
        "/api/public/admin/coupons/validate",
        { code },
        { skipAuth: true }
      );

      if (result.valid) {
        setCouponApplied({ code, discountPercentage: result.discountPercentage });
        setCouponError("");
        toast.success(`Coupon applied! ${result.discountPercentage}% discount`);
      } else {
        setCouponError(result.message || "Invalid coupon code");
        setCouponApplied(null);
      }
    } catch (err: any) {
      setCouponError(err?.message || "Failed to validate coupon");
      setCouponApplied(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError("");
  };

  // Handle payment with coupon
  const handleProCheckout = () => {
    handleCheckout(discountedPrice, couponApplied?.code);
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      icon: Sparkles,
      description: "For individuals just starting out",
      features: [
        "Up to 5 projects",
        "Basic AI chatbot responses",
        "Public feedback forms",
        "Community support",
        '"Powered by Neesh AI" branding on all blogs'
      ],
      buttonText: currentPlan === "FREE" ? "Current Plan" : "Free Plan",
      disabled: true,
      popular: false,
      isCurrent: currentPlan === "FREE",
      gradient: "from-slate-500/20 to-slate-600/20",
      borderColor: "border-border",
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      icon: Crown,
      description: "For professionals and growing teams",
      features: [
        "Unlimited projects",
        "Advanced AI (GPT-4 class)",
        "Remove 'Powered by Neesh AI'",
        "Custom logo & branding (white-label)",
        "Cross-promotion engine — promote blogs via tags",
        "Appear in 'More Like This' sections",
        "Priority email support"
      ],
      buttonText: isPro ? "Current Plan ✓" : "Upgrade to Pro ⚡",
      disabled: isPro,
      popular: true,
      isCurrent: currentPlan === "PRO",
      isPro: true,
      gradient: "from-blue-600/20 via-indigo-600/20 to-red-500/20",
      borderColor: "border-blue-500/50",
    },
    {
      name: "Enterprise",
      price: "Custom",
      icon: Building2,
      description: "For large-scale operations",
      features: [
        "Everything in Pro",
        "SLA & dedicated support",
        "Custom AI model training",
        "Team accounts & API access",
        "Bulk data ingestion",
        "Advanced analytics dashboard"
      ],
      buttonText: isEnterprise ? "Current Plan ✓" : "Contact Sales",
      disabled: isEnterprise,
      popular: false,
      isCurrent: currentPlan === "ENTERPRISE",
      gradient: "from-violet-500/20 to-purple-600/20",
      borderColor: "border-violet-500/30",
    }
  ];

  const handleEnterprise = () => {
    window.location.href = "mailto:hello@neeshai.ai?subject=Enterprise%20Plan%20Inquiry";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Decorative background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-[30%] right-[15%] w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[20%] left-[40%] w-80 h-80 bg-violet-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="mb-6">
            <NeeshLogo size="lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600/80 to-primary/60">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Start free, upgrade when you're ready. Unlock the full power of AI-driven idea validation.
          </p>
          {currentPlan !== "FREE" && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/30">
              <Crown className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600 dark:text-amber-400">
                You're on the {currentPlan} plan
              </span>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                plan.popular
                  ? `${plan.borderColor} shadow-lg shadow-blue-500/10 scale-[1.02] z-10`
                  : `${plan.borderColor}`
              } ${plan.isCurrent ? "ring-2 ring-primary/50" : ""}`}
            >
              {/* Gradient overlay at top */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${plan.gradient}`} />

              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg">
                  ⚡ MOST POPULAR
                </div>
              )}

              {plan.isCurrent && (
                <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-br-xl">
                  ACTIVE
                </div>
              )}

              <CardHeader className="pt-8">
                <div className="flex items-center gap-2 mb-2">
                  <plan.icon className={`w-5 h-5 ${plan.popular ? "text-blue-500" : "text-muted-foreground"}`} />
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline">
                  {/* Show struck-through original + discounted price if coupon applied */}
                  {plan.isPro && couponApplied ? (
                    <>
                      <span className="text-2xl font-medium text-muted-foreground line-through mr-2">
                        ${PRO_PRICE.toFixed(2)}
                      </span>
                      <span className="text-4xl font-extrabold tracking-tight text-green-600 dark:text-green-400">
                        ${discountedPrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  )}
                  {plan.period && (
                    <span className="ml-1 text-xl font-medium text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                {/* Savings badge */}
                {plan.isPro && couponApplied && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm font-medium">
                    <Ticket className="w-3.5 h-3.5" />
                    You save ${savings.toFixed(2)} ({couponApplied.discountPercentage}% off)
                  </div>
                )}
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className={`h-4 w-4 ${plan.popular ? "text-blue-500" : "text-primary"}`} />
                      </div>
                      <p className="text-sm text-foreground/80">{feature}</p>
                    </li>
                  ))}
                </ul>

                {/* ════ Coupon Code Input (Pro plan only) ════ */}
                {plan.isPro && !isPro && (
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-2">
                      <Ticket className="w-4 h-4 text-blue-500" />
                      Have a coupon code?
                    </label>

                    {couponApplied ? (
                      /* Applied coupon display */
                      <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {couponApplied.code}
                          </span>
                          <span className="text-xs text-green-500/80">
                            ({couponApplied.discountPercentage}% off)
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="p-1 rounded-lg hover:bg-green-500/20 text-green-600 dark:text-green-400 transition-colors"
                          title="Remove coupon"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Coupon input field */
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponError("");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                            className="flex-1 uppercase font-mono tracking-wider"
                          />
                          <Button
                            variant="outline"
                            onClick={handleApplyCoupon}
                            disabled={validatingCoupon || !couponCode.trim()}
                            className="shrink-0"
                          >
                            {validatingCoupon ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Apply"
                            )}
                          </Button>
                        </div>
                        {couponError && (
                          <div className="flex items-center gap-1.5 text-destructive text-xs">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {couponError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-4">
                <Button
                  className={`w-full text-base h-12 font-semibold transition-all duration-300 ${
                    plan.popular && !plan.isCurrent
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                      : ""
                  }`}
                  variant={plan.popular && !plan.isCurrent ? "default" : "outline"}
                  disabled={plan.disabled || isLoading}
                  onClick={() => {
                    if (plan.name === "Enterprise") {
                      handleEnterprise();
                    } else if (plan.isPro) {
                      handleProCheckout();
                    }
                  }}
                >
                  {isLoading && plan.isPro ? (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 animate-pulse" />
                      Processing...
                    </span>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust footer */}
        <div className="mt-16 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            All payments are secured by <strong>Cashfree Payments</strong>. Cancel anytime.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/60">
            <span>🔒 SSL Encrypted</span>
            <span>💳 All Cards Accepted</span>
            <span>📧 24/7 Support</span>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
