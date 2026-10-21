-- Appended once to this migration at publication. Earlier migration is unchanged.
ALTER TABLE "SettlementPayment" ADD CONSTRAINT "SettlementPayment_valid" CHECK
 (currency='NGN' AND "amountMinor">0 AND "amountMinor"<=1000000000000 AND status IN ('PENDING','CREDITED')
 AND ((status='PENDING' AND "settledAt" IS NULL AND "settlementReference" IS NULL)
 OR (status='CREDITED' AND "settledAt" IS NOT NULL AND length(btrim("settlementReference"))>=3)));
ALTER TABLE "SettlementEvent" ADD CONSTRAINT "SettlementEvent_valid" CHECK
 ("providerStatus" IN ('INITIATED','PENDING','FAILED','SETTLED') AND outcome IN ('IGNORED','CREDITED','DUPLICATE')
 AND "payloadDigest" ~ '^[0-9a-f]{64}$' AND length("eventId") BETWEEN 1 AND 150
 AND (("providerStatus"='SETTLED' AND outcome IN ('CREDITED','DUPLICATE')) OR ("providerStatus"<>'SETTLED' AND outcome='IGNORED')));
CREATE UNIQUE INDEX "SettlementEvent_one_credit" ON "SettlementEvent"("paymentId") WHERE outcome='CREDITED';
ALTER TABLE "WalletEntry" DROP CONSTRAINT "WalletEntry_delta_valid";
ALTER TABLE "WalletEntry" ADD CONSTRAINT "WalletEntry_delta_valid" CHECK ("amountMinor">0 AND "amountMinor"<=1000000000000 AND (
 (kind IN ('TOPUP_CREDIT','ADJUSTMENT_CREDIT','SETTLEMENT_CREDIT') AND "postedDeltaMinor"="amountMinor" AND "reservedDeltaMinor"=0)
 OR (kind='RESERVE' AND "postedDeltaMinor"=0 AND "reservedDeltaMinor"="amountMinor" AND "renewalId" IS NOT NULL)
 OR (kind='CAPTURE' AND "postedDeltaMinor"=-"amountMinor" AND "reservedDeltaMinor"=-"amountMinor" AND "renewalId" IS NOT NULL)
 OR (kind='RELEASE' AND "postedDeltaMinor"=0 AND "reservedDeltaMinor"=-"amountMinor" AND "renewalId" IS NOT NULL)
 OR (kind='REVERSAL' AND "postedDeltaMinor"=-"amountMinor" AND "reservedDeltaMinor"=0 AND "reversalOfId" IS NOT NULL)));
ALTER TABLE "WalletEntry" ADD CONSTRAINT "WalletEntry_settlement_source" CHECK
 ((kind='SETTLEMENT_CREDIT')=("settlementPaymentId" IS NOT NULL)
 AND (kind<>'SETTLEMENT_CREDIT' OR ("actorId" IS NULL AND "topUpId" IS NULL AND "renewalId" IS NULL AND "reversalOfId" IS NULL)));

CREATE FUNCTION settlement_terms_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.status<>'PENDING' THEN RAISE EXCEPTION 'Settlement payments must start pending'; END IF;
 ELSE
  IF ROW(OLD.id,OLD."walletId",OLD."customerId",OLD.provider,OLD."providerAccount",OLD."providerPaymentId",OLD."merchantReference",OLD."amountMinor",OLD.currency,OLD."idempotencyKey",OLD."requestFingerprint",OLD.simulated,OLD."createdAt")
  IS DISTINCT FROM ROW(NEW.id,NEW."walletId",NEW."customerId",NEW.provider,NEW."providerAccount",NEW."providerPaymentId",NEW."merchantReference",NEW."amountMinor",NEW.currency,NEW."idempotencyKey",NEW."requestFingerprint",NEW.simulated,NEW."createdAt")
  OR (OLD.status='CREDITED' AND NEW IS DISTINCT FROM OLD) THEN RAISE EXCEPTION 'Settlement terms and credited history are immutable'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER settlement_terms_guard BEFORE INSERT OR UPDATE ON "SettlementPayment" FOR EACH ROW EXECUTE FUNCTION settlement_terms_guard();
CREATE TRIGGER settlement_payment_no_delete BEFORE DELETE ON "SettlementPayment" FOR EACH ROW EXECUTE FUNCTION wallet_history_immutable();
CREATE TRIGGER settlement_event_immutable BEFORE UPDATE OR DELETE ON "SettlementEvent" FOR EACH ROW EXECUTE FUNCTION wallet_history_immutable();
CREATE FUNCTION settlement_claim_references() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO "PaymentReference"(reference,allocation) VALUES(upper(btrim(NEW."merchantReference")),'SETTLEMENT_WALLET');
 IF upper(btrim(NEW."providerPaymentId"))<>upper(btrim(NEW."merchantReference")) THEN
  INSERT INTO "PaymentReference"(reference,allocation) VALUES(upper(btrim(NEW."providerPaymentId")),'SETTLEMENT_WALLET');
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER settlement_claim_references BEFORE INSERT ON "SettlementPayment" FOR EACH ROW EXECUTE FUNCTION settlement_claim_references();

CREATE FUNCTION settlement_payment_complete_check() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE p "SettlementPayment"%ROWTYPE;
BEGIN
 SELECT * INTO p FROM "SettlementPayment" WHERE id=NEW.id;
 IF (p.status='CREDITED') IS DISTINCT FROM EXISTS(SELECT 1 FROM "WalletEntry" e WHERE e."settlementPaymentId"=p.id AND e.kind='SETTLEMENT_CREDIT') THEN RAISE EXCEPTION 'Settlement and wallet credit must commit together'; END IF;
 IF p.status='CREDITED' AND NOT EXISTS(SELECT 1 FROM "SettlementEvent" e WHERE e."paymentId"=p.id AND e.outcome='CREDITED' AND e."providerStatus"='SETTLED') THEN RAISE EXCEPTION 'Verified settlement event receipt required'; END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER settlement_payment_complete_check AFTER INSERT OR UPDATE ON "SettlementPayment" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION settlement_payment_complete_check();
CREATE FUNCTION settlement_entry_check() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.kind='SETTLEMENT_CREDIT' AND NOT EXISTS(
  SELECT 1 FROM "SettlementPayment" p WHERE p.id=NEW."settlementPaymentId" AND p.status='CREDITED'
  AND p."walletId"=NEW."walletId" AND p."customerId"=NEW."customerId" AND p."amountMinor"=NEW."amountMinor"
  AND p.currency='NGN' AND p.simulated=NEW.simulated
 ) THEN RAISE EXCEPTION 'Matching credited wallet settlement required'; END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER settlement_entry_check AFTER INSERT ON "WalletEntry" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION settlement_entry_check();
CREATE FUNCTION settlement_event_check() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM "SettlementPayment" p WHERE p.id=NEW."paymentId" AND p.provider=NEW.provider AND p."providerAccount"=NEW."providerAccount"
 AND (NEW.outcome='IGNORED' OR (p.status='CREDITED' AND EXISTS(SELECT 1 FROM "WalletEntry" e WHERE e."settlementPaymentId"=p.id AND e.kind='SETTLEMENT_CREDIT'))))
 THEN RAISE EXCEPTION 'Provider event must match registered payment and credit'; END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER settlement_event_check AFTER INSERT ON "SettlementEvent" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION settlement_event_check();
