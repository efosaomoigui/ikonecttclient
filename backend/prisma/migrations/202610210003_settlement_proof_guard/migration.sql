-- Explicit NULL guard: PostgreSQL CHECK permits UNKNOWN, so length(NULL) alone is insufficient.
-- Preserve the checksum of the already applied additive settlement migration.
ALTER TABLE "SettlementPayment" ADD CONSTRAINT "SettlementPayment_settlement_proof_required" CHECK
 (status<>'CREDITED' OR ("settledAt" IS NOT NULL AND "settlementReference" IS NOT NULL AND length(btrim("settlementReference"))>=3));
