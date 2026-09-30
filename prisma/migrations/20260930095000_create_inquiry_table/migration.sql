CREATE TABLE "inquiry" (
    "inquiry_id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "sender_email" VARCHAR(254) NOT NULL,
    "date_submitted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_pkey" PRIMARY KEY ("inquiry_id")
);

CREATE INDEX "inquiry_date_submitted_idx" ON "inquiry"("date_submitted");