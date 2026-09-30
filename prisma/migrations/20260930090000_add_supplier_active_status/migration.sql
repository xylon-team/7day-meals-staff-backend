-- Add an active flag so supplier records can be deactivated without deleting history.
ALTER TABLE "supplier"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
