-- CreateTable
CREATE TABLE "public"."register_writers" (
    "register_writer_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "IdCard" TEXT NOT NULL,
    "SelfieWithIdCard" TEXT NOT NULL,
    "numIdCard" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "BankAccount" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "register_writers_pkey" PRIMARY KEY ("register_writer_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "register_writers_user_id_key" ON "public"."register_writers"("user_id");

-- AddForeignKey
ALTER TABLE "public"."register_writers" ADD CONSTRAINT "register_writers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
