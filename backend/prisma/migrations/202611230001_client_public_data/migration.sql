ALTER TABLE "Plan" ALTER COLUMN "priceMinor" DROP NOT NULL;
ALTER TABLE "Plan" ALTER COLUMN "billingDays" DROP NOT NULL;
ALTER TABLE "Plan" ADD COLUMN "uploadMbps" INTEGER;
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_upload_valid" CHECK ("uploadMbps" IS NULL OR ("uploadMbps">0 AND "uploadMbps"<=100000));
CREATE TABLE "ServiceArea" (
 "id" UUID NOT NULL PRIMARY KEY,"sourceKey" TEXT NOT NULL UNIQUE,"sourceName" TEXT NOT NULL,"name" TEXT NOT NULL,"scope" TEXT NOT NULL,
 "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],"searchText" TEXT NOT NULL,"active" BOOLEAN NOT NULL DEFAULT true,"displayPrimary" BOOLEAN NOT NULL DEFAULT true,
 "duplicateGroup" TEXT,"reviewNote" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "ServiceArea_scope_valid" CHECK(scope IN ('ESTATE','AREA','SITE'))
);
CREATE TABLE "KnowledgeArticle" (
 "id" UUID NOT NULL PRIMARY KEY,"key" TEXT NOT NULL UNIQUE,"category" TEXT NOT NULL,"question" TEXT NOT NULL,"answer" TEXT NOT NULL,
 "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],"published" BOOLEAN NOT NULL DEFAULT false,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL
);
