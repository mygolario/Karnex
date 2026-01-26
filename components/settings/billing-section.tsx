"use client";

import { useState } from "react";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Crown,
  Sparkles,
  Users,
  Zap,
  Calendar,
  Receipt,
  ExternalLink,
  ChevronLeft,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { getPlanById, formatPrice } from "@/lib/payment/pricing";

export function BillingSection() {
  const { subscription, tier, features, loading, isPro, refresh } = useSubscription();
  const [cancelling, setCancelling] = useState(false);

  if (loading) {
    return <BillingSkeleton />;
  }

  const plan = subscription ? getPlanById(subscription.planId) : null;
  const tierIcons = {
    free: Zap,
    pro: Sparkles,
    team: Users,
    enterprise: Crown,
  };
  const TierIcon = tierIcons[tier];

  const tierColors = {
    free: "bg-muted text-muted-foreground",
    pro: "bg-primary/10 text-primary",
    team: "bg-purple-500/10 text-purple-600",
    enterprise: "bg-amber-500/10 text-amber-600",
  };

  const tierLabels = {
    free: "رایگان",
    pro: "حرفه‌ای",
    team: "تیمی",
    enterprise: "سازمانی",
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">پلن فعلی</h3>
            <p className="text-sm text-muted-foreground">مدیریت اشتراک و صورتحساب</p>
          </div>
          <Badge className={tierColors[tier]}>
            <TierIcon size={12} className="ml-1" />
            {tierLabels[tier]}
          </Badge>
        </div>

        {tier === "free" ? (
          <div className="bg-muted/50 rounded-xl p-5 text-center">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap size={24} className="text-muted-foreground" />
            </div>
            <h4 className="font-bold text-foreground mb-2">شما در پلن رایگان هستید</h4>
            <p className="text-sm text-muted-foreground mb-4">
              برای دسترسی به تمام ویژگی‌ها، پلن خود را ارتقا دهید.
            </p>
            <Link href="/pricing">
              <Button variant="gradient">
                <Crown size={16} />
                ارتقای پلن
                <ChevronLeft size={16} />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Plan Details */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tierColors[tier]}`}>
                  <TierIcon size={20} />
                </div>
                <div>
                  <div className="font-bold text-foreground">{plan?.name || tierLabels[tier]}</div>
                  <div className="text-sm text-muted-foreground">
                    اشتراک {subscription?.billingCycle === "yearly" ? "سالانه" : "ماهانه"}
                  </div>
                </div>
              </div>
              <div className="text-left">
                <div className="font-bold text-foreground">
                  {plan ? formatPrice(
                    subscription?.billingCycle === "yearly" 
                      ? plan.price.yearly 
                      : plan.price.monthly
                  ) : "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  در {subscription?.billingCycle === "yearly" ? "سال" : "ماه"}
                </div>
              </div>
            </div>

            {/* Renewal Date */}
            {subscription && (
              <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">تاریخ تمدید</span>
                </div>
                <div className="text-sm font-medium text-foreground">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString("fa-IR")}
                </div>
              </div>
            )}

            {/* Cancel Warning */}
            {subscription?.cancelAtPeriodEnd && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong>اشتراک شما لغو شده است.</strong>
                  <br />
                  تا تاریخ{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString("fa-IR")}
                  {" "}به ویژگی‌های پلن دسترسی خواهید داشت.
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/pricing">
                <Button variant="outline" size="sm">
                  <Crown size={14} />
                  تغییر پلن
                </Button>
              </Link>
              {!subscription?.cancelAtPeriodEnd && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setCancelling(true)}
                >
                  لغو اشتراک
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Feature Usage */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">میزان استفاده</h3>
        
        <div className="space-y-4">
          <UsageItem
            label="تولید محتوا با AI"
            used={15}
            limit={features.aiGenerations}
            icon={Sparkles}
          />
          <UsageItem
            label="پروژه‌ها"
            used={1}
            limit={features.projectLimit}
            icon={CreditCard}
          />
          {features.teamMembers > 0 && (
            <UsageItem
              label="اعضای تیم"
              used={2}
              limit={features.teamMembers}
              icon={Users}
            />
          )}
        </div>
      </Card>

      {/* Payment History Link */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt size={20} className="text-muted-foreground" />
            <div>
              <h3 className="font-bold text-foreground">تاریخچه پرداخت‌ها</h3>
              <p className="text-sm text-muted-foreground">مشاهده فاکتورها و رسیدها</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            مشاهده
            <ExternalLink size={14} />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function UsageItem({
  label,
  used,
  limit,
  icon: Icon,
}: {
  label: string;
  used: number;
  limit: number | "unlimited";
  icon: React.ElementType;
}) {
  const isUnlimited = limit === "unlimited";
  const percentage = isUnlimited ? 0 : (used / (limit as number)) * 100;
  const isNearLimit = !isUnlimited && percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-muted-foreground" />
          <span className="text-foreground">{label}</span>
        </div>
        <span className={isNearLimit ? "text-amber-600 font-medium" : "text-muted-foreground"}>
          {used} / {isUnlimited ? "∞" : limit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isNearLimit ? "bg-amber-500" : "bg-primary"
          }`}
          style={{ width: isUnlimited ? "10%" : `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function BillingSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-6 w-28 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    </div>
  );
}
