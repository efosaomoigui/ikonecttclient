-- Appended to migration.sql at publication; retained here as readable integrity source.
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_balances_valid" CHECK
 ("postedMinor" >= 0 AND "postedMinor" <= 1000000000000 AND "reservedMinor" >= 0 AND "reservedMinor" <= "postedMinor");
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_renewal_price_valid" CHECK ("renewalPriceMinor" IS NULL OR ("renewalPriceMinor">0 AND "renewalPriceMinor"<=1000000000000));
ALTER TABLE "Order" ADD CONSTRAINT "Order_funding_valid" CHECK ("fundingSource" IN ('ORDER_PAYMENT','WALLET'));
ALTER TABLE "WalletTopUp" ADD CONSTRAINT "WalletTopUp_allocation_valid" CHECK (allocation='WALLET' AND currency='NGN' AND "amountMinor">0 AND "amountMinor"<=1000000000000);
ALTER TABLE "WalletRenewal" ADD CONSTRAINT "WalletRenewal_valid" CHECK
 (currency='NGN' AND "amountMinor">0 AND "amountMinor"<=1000000000000 AND "billingDays">0 AND "billingDays"<=366
 AND status IN ('RESERVED','PROCESSING','REQUIRES_REVIEW','SUCCEEDED','FAILED') AND "providerMode" IN ('manual','simulated','disabled'));
CREATE UNIQUE INDEX "WalletRenewal_one_pending_service" ON "WalletRenewal"("subscriptionId") WHERE status IN ('RESERVED','PROCESSING','REQUIRES_REVIEW');
ALTER TABLE "WalletEntry" ADD CONSTRAINT "WalletEntry_delta_valid" CHECK ("amountMinor">0 AND "amountMinor"<=1000000000000 AND (
 (kind IN ('TOPUP_CREDIT','ADJUSTMENT_CREDIT') AND "postedDeltaMinor"="amountMinor" AND "reservedDeltaMinor"=0)
 OR (kind='RESERVE' AND "postedDeltaMinor"=0 AND "reservedDeltaMinor"="amountMinor" AND "renewalId" IS NOT NULL)
 OR (kind='CAPTURE' AND "postedDeltaMinor"=-"amountMinor" AND "reservedDeltaMinor"=-"amountMinor" AND "renewalId" IS NOT NULL)
 OR (kind='RELEASE' AND "postedDeltaMinor"=0 AND "reservedDeltaMinor"=-"amountMinor" AND "renewalId" IS NOT NULL)
 OR (kind='REVERSAL' AND "postedDeltaMinor"=-"amountMinor" AND "reservedDeltaMinor"=0 AND "reversalOfId" IS NOT NULL)));

CREATE FUNCTION wallet_history_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Financial history is append-only; use a compensating entry'; END $$;
CREATE TRIGGER wallet_entry_immutable BEFORE UPDATE OR DELETE ON "WalletEntry" FOR EACH ROW EXECUTE FUNCTION wallet_history_immutable();
CREATE TRIGGER wallet_topup_no_delete BEFORE DELETE ON "WalletTopUp" FOR EACH ROW EXECUTE FUNCTION wallet_history_immutable();
CREATE TRIGGER wallet_renewal_no_delete BEFORE DELETE ON "WalletRenewal" FOR EACH ROW EXECUTE FUNCTION wallet_history_immutable();
CREATE TRIGGER payment_reference_immutable BEFORE UPDATE OR DELETE ON "PaymentReference" FOR EACH ROW EXECUTE FUNCTION wallet_history_immutable();

CREATE FUNCTION wallet_projection_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF pg_trigger_depth()<2 THEN RAISE EXCEPTION 'Wallet projections are maintained only by ledger inserts'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER wallet_projection_guard BEFORE UPDATE OF "postedMinor","reservedMinor" ON "Wallet" FOR EACH ROW EXECUTE FUNCTION wallet_projection_guard();
CREATE FUNCTION wallet_identity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW."postedMinor"<>0 OR NEW."reservedMinor"<>0 THEN RAISE EXCEPTION 'Wallets must open at zero'; END IF;
 ELSIF NEW.id<>OLD.id OR NEW."customerId"<>OLD."customerId" THEN RAISE EXCEPTION 'Wallet ownership is immutable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER wallet_identity_guard BEFORE INSERT OR UPDATE ON "Wallet" FOR EACH ROW EXECUTE FUNCTION wallet_identity_guard();
CREATE TRIGGER wallet_no_delete BEFORE DELETE ON "Wallet" FOR EACH ROW EXECUTE FUNCTION wallet_history_immutable();

CREATE FUNCTION wallet_post_entry() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE original "WalletEntry"%ROWTYPE;
BEGIN
 PERFORM 1 FROM "Wallet" WHERE id=NEW."walletId" AND "customerId"=NEW."customerId" FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Wallet ownership mismatch'; END IF;
 IF NEW.kind='REVERSAL' THEN
  SELECT * INTO original FROM "WalletEntry" WHERE id=NEW."reversalOfId";
  IF NOT FOUND OR original."walletId"<>NEW."walletId" OR original.kind NOT IN ('TOPUP_CREDIT','ADJUSTMENT_CREDIT') OR original."amountMinor"<>NEW."amountMinor" THEN
   RAISE EXCEPTION 'Invalid credit compensation';
  END IF;
 END IF;
 UPDATE "Wallet" SET "postedMinor"="postedMinor"+NEW."postedDeltaMinor", "reservedMinor"="reservedMinor"+NEW."reservedDeltaMinor"
 WHERE id=NEW."walletId" RETURNING "postedMinor","reservedMinor" INTO NEW."postedAfterMinor",NEW."reservedAfterMinor";
 RETURN NEW;
END $$;
CREATE TRIGGER wallet_post_entry BEFORE INSERT ON "WalletEntry" FOR EACH ROW EXECUTE FUNCTION wallet_post_entry();

-- Deferred checks require verification/final service state in the same committed transaction.
CREATE FUNCTION wallet_entry_allocation_check() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.kind='TOPUP_CREDIT' AND NOT EXISTS (SELECT 1 FROM "WalletTopUp" t WHERE t.id=NEW."topUpId" AND t."walletId"=NEW."walletId" AND t."amountMinor"=NEW."amountMinor" AND t.status='CONFIRMED' AND t.allocation='WALLET') THEN
  RAISE EXCEPTION 'Verified wallet-allocated top-up required';
 END IF;
 IF NEW.kind IN ('RESERVE','CAPTURE','RELEASE') AND NOT EXISTS (
  SELECT 1 FROM "WalletRenewal" r JOIN "Order" o ON o.id=r."orderId"
  WHERE r.id=NEW."renewalId" AND r."walletId"=NEW."walletId" AND r."amountMinor"=NEW."amountMinor"
  AND o."customerId"=NEW."customerId" AND o."fundingSource"='WALLET' AND o.type='RENEWAL'
  AND (NEW.kind='RESERVE' OR (NEW.kind='CAPTURE' AND r.status='SUCCEEDED' AND o.status='COMPLETED' AND r."confirmedEndsAt" IS NOT NULL) OR (NEW.kind='RELEASE' AND r.status='FAILED' AND o.status='CANCELLED'))
 ) THEN RAISE EXCEPTION 'Legitimate matching renewal allocation required'; END IF;
 IF NEW.kind IN ('CAPTURE','RELEASE') AND (
  NOT EXISTS(SELECT 1 FROM "WalletEntry" e WHERE e."renewalId"=NEW."renewalId" AND e.kind='RESERVE' AND e."walletId"=NEW."walletId" AND e."amountMinor"=NEW."amountMinor")
  OR EXISTS(SELECT 1 FROM "WalletEntry" e WHERE e."renewalId"=NEW."renewalId" AND e.kind=CASE WHEN NEW.kind='CAPTURE' THEN 'RELEASE' ELSE 'CAPTURE' END)
 ) THEN RAISE EXCEPTION 'Matching hold and exclusive settlement required'; END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER wallet_entry_allocation_check AFTER INSERT ON "WalletEntry" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION wallet_entry_allocation_check();

CREATE FUNCTION wallet_topup_terms_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF ROW(OLD."walletId",OLD."customerId",OLD."amountMinor",OLD.currency,OLD.reference,OLD.allocation,OLD."idempotencyKey",OLD."requestFingerprint",OLD.evidence,OLD.method)
 IS DISTINCT FROM ROW(NEW."walletId",NEW."customerId",NEW."amountMinor",NEW.currency,NEW.reference,NEW.allocation,NEW."idempotencyKey",NEW."requestFingerprint",NEW.evidence,NEW.method)
 OR (OLD.status<>'REPORTED' AND NEW IS DISTINCT FROM OLD) THEN RAISE EXCEPTION 'Top-up allocation and reviewed history are immutable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER wallet_topup_terms_immutable BEFORE UPDATE ON "WalletTopUp" FOR EACH ROW EXECUTE FUNCTION wallet_topup_terms_immutable();

CREATE FUNCTION wallet_renewal_terms_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.status<>'RESERVED' OR NEW."confirmedEndsAt" IS NOT NULL THEN RAISE EXCEPTION 'New renewal must start reserved'; END IF;
 ELSE
  IF ROW(OLD.id,OLD."walletId",OLD."customerId",OLD."subscriptionId",OLD."orderId",OLD."planId",OLD."planName",OLD."amountMinor",OLD.currency,OLD."billingDays",OLD."priceVersion",OLD."previousEndsAt",OLD."expectedEndsAt",OLD."providerMode",OLD.simulated,OLD."idempotencyKey",OLD."requestFingerprint")
  IS DISTINCT FROM ROW(NEW.id,NEW."walletId",NEW."customerId",NEW."subscriptionId",NEW."orderId",NEW."planId",NEW."planName",NEW."amountMinor",NEW.currency,NEW."billingDays",NEW."priceVersion",NEW."previousEndsAt",NEW."expectedEndsAt",NEW."providerMode",NEW.simulated,NEW."idempotencyKey",NEW."requestFingerprint") THEN RAISE EXCEPTION 'Reserved renewal terms are immutable'; END IF;
  IF OLD.status IN ('SUCCEEDED','FAILED') AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'Final renewal outcomes are immutable'; END IF;
  IF NEW.status='RESERVED' AND OLD.status<>'RESERVED' THEN RAISE EXCEPTION 'Uncertain renewals cannot be blindly retried'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER wallet_renewal_terms_guard BEFORE INSERT OR UPDATE ON "WalletRenewal" FOR EACH ROW EXECUTE FUNCTION wallet_renewal_terms_guard();

CREATE FUNCTION wallet_renewal_complete_check() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE r "WalletRenewal"%ROWTYPE;
BEGIN
 SELECT * INTO r FROM "WalletRenewal" WHERE id=NEW.id;
 IF NOT EXISTS(SELECT 1 FROM "WalletEntry" WHERE "renewalId"=r.id AND kind='RESERVE') THEN RAISE EXCEPTION 'Renewal requires a ledger reservation'; END IF;
 IF r.status='SUCCEEDED' AND (NOT EXISTS(SELECT 1 FROM "WalletEntry" WHERE "renewalId"=r.id AND kind='CAPTURE') OR NOT EXISTS(SELECT 1 FROM "Subscription" s WHERE s.id=r."subscriptionId" AND s."endsAt"=r."confirmedEndsAt" AND s.status='ACTIVE')) THEN RAISE EXCEPTION 'Successful renewal requires captured funds and confirmed service'; END IF;
 IF r.status='FAILED' AND NOT EXISTS(SELECT 1 FROM "WalletEntry" WHERE "renewalId"=r.id AND kind='RELEASE') THEN RAISE EXCEPTION 'Failed renewal must release its hold'; END IF;
 IF r.status IN ('RESERVED','PROCESSING','REQUIRES_REVIEW') AND EXISTS(SELECT 1 FROM "WalletEntry" WHERE "renewalId"=r.id AND kind IN ('CAPTURE','RELEASE')) THEN RAISE EXCEPTION 'Pending outcome cannot settle funds'; END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER wallet_renewal_complete_check AFTER INSERT OR UPDATE ON "WalletRenewal" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION wallet_renewal_complete_check();

CREATE FUNCTION wallet_topup_credit_check() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE t "WalletTopUp"%ROWTYPE;
BEGIN
 SELECT * INTO t FROM "WalletTopUp" WHERE id=NEW.id;
 IF t.status<>'REPORTED' AND (t."verifiedAt" IS NULL OR t."verifiedById" IS NULL OR length(btrim(t."verificationEvidence"))<3 OR t."verificationEvidence" IS NULL) THEN RAISE EXCEPTION 'Reviewed top-up requires verifier and evidence'; END IF;
 IF (t.status='CONFIRMED') IS DISTINCT FROM EXISTS(SELECT 1 FROM "WalletEntry" WHERE "topUpId"=t.id AND kind='TOPUP_CREDIT') THEN RAISE EXCEPTION 'Top-up confirmation and ledger credit must commit together'; END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER wallet_topup_credit_check AFTER INSERT OR UPDATE ON "WalletTopUp" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION wallet_topup_credit_check();

CREATE FUNCTION customer_open_wallet() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN INSERT INTO "Wallet"(id,"customerId") VALUES(gen_random_uuid(),NEW.id); RETURN NEW; END $$;
CREATE TRIGGER customer_open_wallet AFTER INSERT ON "Customer" FOR EACH ROW EXECUTE FUNCTION customer_open_wallet();
-- Zero opening balances only. Existing confirmed/reported order payments are never wallet credits.
INSERT INTO "Wallet"(id,"customerId") SELECT gen_random_uuid(),id FROM "Customer";
INSERT INTO "PaymentReference"(reference,allocation) SELECT DISTINCT upper(btrim(reference)),'ORDER' FROM "Payment";
-- Protect every insertion path, including fixtures, rather than only HTTP services.
CREATE FUNCTION payment_claim_reference() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 -- Native upsert executes BEFORE INSERT even when the identical existing row wins.
 IF TG_TABLE_NAME='Payment' AND EXISTS(SELECT 1 FROM "Payment" WHERE id=NEW.id AND reference=NEW.reference) THEN RETURN NEW; END IF;
 IF TG_TABLE_NAME='WalletTopUp' AND EXISTS(SELECT 1 FROM "WalletTopUp" WHERE id=NEW.id AND reference=NEW.reference) THEN RETURN NEW; END IF;
 INSERT INTO "PaymentReference"(reference,allocation) VALUES(upper(btrim(NEW.reference)),CASE WHEN TG_TABLE_NAME='Payment' THEN 'ORDER' ELSE 'WALLET' END);
 RETURN NEW;
END $$;
CREATE TRIGGER order_payment_reference_claim BEFORE INSERT ON "Payment" FOR EACH ROW EXECUTE FUNCTION payment_claim_reference();
CREATE TRIGGER wallet_payment_reference_claim BEFORE INSERT ON "WalletTopUp" FOR EACH ROW EXECUTE FUNCTION payment_claim_reference();
ALTER TABLE "WalletEntry" ADD CONSTRAINT "WalletEntry_actor_fkey" FOREIGN KEY("actorId") REFERENCES "User"(id) ON DELETE RESTRICT;
ALTER TABLE "WalletTopUp" ADD CONSTRAINT "WalletTopUp_verifier_fkey" FOREIGN KEY("verifiedById") REFERENCES "User"(id) ON DELETE RESTRICT;
ALTER TABLE "WalletRenewal" ADD CONSTRAINT "WalletRenewal_resolver_fkey" FOREIGN KEY("resolvedById") REFERENCES "User"(id) ON DELETE RESTRICT;
