/*
  Warnings:

  - You are about to drop the column `prefecture` on the `Facility` table. All the data in the column will be lost.
  - Added the required column `prefectureId` to the `Facility` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Facility_prefecture_idx";

-- AlterTable
ALTER TABLE "Facility" DROP COLUMN "prefecture",
ADD COLUMN     "prefectureId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Prefecture" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(5) NOT NULL,

    CONSTRAINT "Prefecture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Facility_prefectureId_idx" ON "Facility"("prefectureId");

-- AddForeignKey
ALTER TABLE "Facility" ADD CONSTRAINT "Facility_prefectureId_fkey" FOREIGN KEY ("prefectureId") REFERENCES "Prefecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
