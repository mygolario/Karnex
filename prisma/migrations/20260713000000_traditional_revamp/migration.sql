-- Traditional Pillar Revamp — operations + finance relational tables
-- Inventory & Stock Manager (Product, StockTransaction, Supplier)
-- P&L / Income Tracker (BusinessTransaction)

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "category" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'عدد',
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lowStockAt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supplierId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Product_projectId_idx" ON "Product"("projectId");
CREATE INDEX IF NOT EXISTS "Product_projectId_category_idx" ON "Product"("projectId", "category");

CREATE TABLE IF NOT EXISTS "StockTransaction" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockTransaction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "StockTransaction_projectId_idx" ON "StockTransaction"("projectId");
CREATE INDEX IF NOT EXISTS "StockTransaction_productId_idx" ON "StockTransaction"("productId");
CREATE INDEX IF NOT EXISTS "StockTransaction_createdAt_idx" ON "StockTransaction"("createdAt");

CREATE TABLE IF NOT EXISTS "Supplier" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "address" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Supplier_projectId_idx" ON "Supplier"("projectId");

CREATE TABLE IF NOT EXISTS "BusinessTransaction" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessTransaction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "BusinessTransaction_projectId_idx" ON "BusinessTransaction"("projectId");
CREATE INDEX IF NOT EXISTS "BusinessTransaction_projectId_type_idx" ON "BusinessTransaction"("projectId", "type");
CREATE INDEX IF NOT EXISTS "BusinessTransaction_projectId_date_idx" ON "BusinessTransaction"("projectId", "date");
CREATE INDEX IF NOT EXISTS "BusinessTransaction_projectId_category_idx" ON "BusinessTransaction"("projectId", "category");

-- Foreign keys
ALTER TABLE "Product" ADD CONSTRAINT "Product_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "BusinessTransaction" ADD CONSTRAINT "BusinessTransaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;

-- Phase 2–4 tables
CREATE TABLE IF NOT EXISTS "Staff" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "phone" TEXT,
    "hourlyRate" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Staff_projectId_idx" ON "Staff"("projectId");

CREATE TABLE IF NOT EXISTS "Shift" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Shift_staffId_idx" ON "Shift"("staffId");
CREATE INDEX IF NOT EXISTS "Shift_projectId_idx" ON "Shift"("projectId");
CREATE INDEX IF NOT EXISTS "Shift_startAt_idx" ON "Shift"("startAt");

CREATE TABLE IF NOT EXISTS "AttendanceEntry" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttendanceEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AttendanceEntry_staffId_idx" ON "AttendanceEntry"("staffId");
CREATE INDEX IF NOT EXISTS "AttendanceEntry_projectId_idx" ON "AttendanceEntry"("projectId");

CREATE TABLE IF NOT EXISTS "LoyaltyAccount" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerName" TEXT,
    "phone" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT DEFAULT 'bronze',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LoyaltyAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "LoyaltyAccount_projectId_customerId_key" ON "LoyaltyAccount"("projectId", "customerId");
CREATE INDEX IF NOT EXISTS "LoyaltyAccount_projectId_idx" ON "LoyaltyAccount"("projectId");

CREATE TABLE IF NOT EXISTS "PointTransaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PointTransaction_accountId_idx" ON "PointTransaction"("accountId");
CREATE INDEX IF NOT EXISTS "PointTransaction_projectId_idx" ON "PointTransaction"("projectId");

CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT,
    "paymentMethod" TEXT,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Order_projectId_idx" ON "Order"("projectId");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");

CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lineTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");

CREATE TABLE IF NOT EXISTS "Promotion" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "discountPct" DOUBLE PRECISION,
    "code" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "copy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Promotion_projectId_idx" ON "Promotion"("projectId");

CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountPct" DOUBLE PRECISION,
    "discountAmt" DOUBLE PRECISION,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_projectId_code_key" ON "Coupon"("projectId", "code");
CREATE INDEX IF NOT EXISTS "Coupon_projectId_idx" ON "Coupon"("projectId");

CREATE TABLE IF NOT EXISTS "CouponRedemption" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CouponRedemption_couponId_idx" ON "CouponRedemption"("couponId");
CREATE INDEX IF NOT EXISTS "CouponRedemption_projectId_idx" ON "CouponRedemption"("projectId");

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "author" TEXT,
    "rating" INTEGER NOT NULL,
    "body" TEXT,
    "source" TEXT,
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Review_projectId_idx" ON "Review"("projectId");
CREATE INDEX IF NOT EXISTS "Review_rating_idx" ON "Review"("rating");

CREATE TABLE IF NOT EXISTS "Referral" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "referrerId" TEXT,
    "referrerName" TEXT,
    "refereeId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rewardPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Referral_projectId_code_key" ON "Referral"("projectId", "code");
CREATE INDEX IF NOT EXISTS "Referral_projectId_idx" ON "Referral"("projectId");

CREATE TABLE IF NOT EXISTS "Broadcast" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Broadcast_projectId_idx" ON "Broadcast"("projectId");

CREATE TABLE IF NOT EXISTS "Appointment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "service" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'booked',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Appointment_projectId_idx" ON "Appointment"("projectId");
CREATE INDEX IF NOT EXISTS "Appointment_startAt_idx" ON "Appointment"("startAt");

ALTER TABLE "Staff" ADD CONSTRAINT "Staff_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE;
ALTER TABLE "AttendanceEntry" ADD CONSTRAINT "AttendanceEntry_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE;
ALTER TABLE "LoyaltyAccount" ADD CONSTRAINT "LoyaltyAccount_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE;
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE;
