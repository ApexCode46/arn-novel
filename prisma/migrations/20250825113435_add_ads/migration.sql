-- CreateTable
CREATE TABLE "public"."ads" (
    "ad_id" SERIAL NOT NULL,
    "name_as" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "path_img" TEXT NOT NULL,
    "link" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("ad_id")
);

-- AddForeignKey
ALTER TABLE "public"."ads" ADD CONSTRAINT "ads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
