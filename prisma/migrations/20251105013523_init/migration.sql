/*
  Warnings:

  - You are about to drop the `Analysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Result` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Result_after_analysis_id_key";

-- DropIndex
DROP INDEX "Result_before_analysis_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Analysis";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Result";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "VideoAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "video" TEXT NOT NULL,
    "graph_data" JSONB NOT NULL,
    "range_of_motion" REAL NOT NULL,
    "upper_arm_movement" REAL NOT NULL,
    "forearm_movement" REAL NOT NULL,
    "smoothness" REAL NOT NULL,
    "upper_arm_smoothness" REAL NOT NULL,
    "forearm_smoothness" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "TreatmentResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type_of_treatment" TEXT,
    "percent_change_range_of_motion" REAL NOT NULL,
    "rom_p_value" REAL NOT NULL,
    "percent_change_of_smoothness" REAL NOT NULL,
    "smoothness_p_value" REAL NOT NULL,
    "patient_id" INTEGER,
    "before_analysis_id" INTEGER NOT NULL,
    "after_analysis_id" INTEGER NOT NULL,
    CONSTRAINT "TreatmentResult_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TreatmentResult_before_analysis_id_fkey" FOREIGN KEY ("before_analysis_id") REFERENCES "VideoAnalysis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TreatmentResult_after_analysis_id_fkey" FOREIGN KEY ("after_analysis_id") REFERENCES "VideoAnalysis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dob" DATETIME,
    "name" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Patient" ("dob", "id", "name") SELECT "dob", "id", coalesce("name", '') AS "name" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentResult_before_analysis_id_key" ON "TreatmentResult"("before_analysis_id");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentResult_after_analysis_id_key" ON "TreatmentResult"("after_analysis_id");
