/*
  Warnings:

  - Made the column `patient_id` on table `TreatmentResult` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TreatmentResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type_of_treatment" TEXT,
    "percent_change_range_of_motion" REAL NOT NULL,
    "rom_p_value" REAL NOT NULL,
    "percent_change_of_smoothness" REAL NOT NULL,
    "smoothness_p_value" REAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "before_analysis_id" INTEGER NOT NULL,
    "after_analysis_id" INTEGER NOT NULL,
    CONSTRAINT "TreatmentResult_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TreatmentResult_before_analysis_id_fkey" FOREIGN KEY ("before_analysis_id") REFERENCES "VideoAnalysis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TreatmentResult_after_analysis_id_fkey" FOREIGN KEY ("after_analysis_id") REFERENCES "VideoAnalysis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TreatmentResult" ("after_analysis_id", "before_analysis_id", "id", "patient_id", "percent_change_of_smoothness", "percent_change_range_of_motion", "rom_p_value", "smoothness_p_value", "type_of_treatment") SELECT "after_analysis_id", "before_analysis_id", "id", "patient_id", "percent_change_of_smoothness", "percent_change_range_of_motion", "rom_p_value", "smoothness_p_value", "type_of_treatment" FROM "TreatmentResult";
DROP TABLE "TreatmentResult";
ALTER TABLE "new_TreatmentResult" RENAME TO "TreatmentResult";
CREATE UNIQUE INDEX "TreatmentResult_before_analysis_id_key" ON "TreatmentResult"("before_analysis_id");
CREATE UNIQUE INDEX "TreatmentResult_after_analysis_id_key" ON "TreatmentResult"("after_analysis_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
