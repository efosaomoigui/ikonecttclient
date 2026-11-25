CREATE TABLE "AssistantSettings" (
 "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',"enabled" BOOLEAN NOT NULL DEFAULT false,"provider" TEXT NOT NULL DEFAULT 'openai',"model" TEXT NOT NULL DEFAULT 'gpt-4.1-mini',"encryptedCredential" TEXT,"environmentRevoked" BOOLEAN NOT NULL DEFAULT false,"maxOutputTokens" INTEGER NOT NULL DEFAULT 300,"dailyRequestLimit" INTEGER NOT NULL DEFAULT 100,"lastTestStatus" TEXT NOT NULL DEFAULT 'UNTESTED',"whatsappUrl" TEXT NOT NULL DEFAULT 'https://api.whatsapp.com/send/?phone=2349168965000&text&type=phone_number&app_absent=0',"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "AssistantSettings_limits" CHECK("maxOutputTokens" BETWEEN 64 AND 600 AND "dailyRequestLimit" BETWEEN 1 AND 1000 AND provider='openai')
);
CREATE TABLE "AssistantUsage" ("id" UUID NOT NULL PRIMARY KEY,"day" TEXT NOT NULL,"status" TEXT NOT NULL,"inputTokens" INTEGER NOT NULL DEFAULT 0,"outputTokens" INTEGER NOT NULL DEFAULT 0,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "AssistantUsage_day_idx" ON "AssistantUsage"("day");
