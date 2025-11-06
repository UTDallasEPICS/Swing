-- CreateTable
CREATE TABLE "Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dob" DATETIME,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Analysis" (
    "analysis_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "video" TEXT,
    "graphs" TEXT,
    "range_of_motion" REAL,
    "Upper_arm_movement" REAL,
    "Forearm_movement" REAL,
    "Smoothness" REAL,
    "Upper_arm_smoothness" REAL,
    "Forearm_smoothness" REAL
);

-- CreateTable
CREATE TABLE "Result" (
    "result_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type_of_treatment" TEXT,
    "percent_change_range_of_motion" REAL,
    "ROM_pValue" REAL,
    "percent_change_of_smoothness" REAL,
    "Smoothness_pValue" REAL,
    "patient_id" INTEGER,
    "before_analysis_id" INTEGER,
    "after_analysis_id" INTEGER,
    CONSTRAINT "Result_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Result_before_analysis_id_fkey" FOREIGN KEY ("before_analysis_id") REFERENCES "Analysis" ("analysis_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Result_after_analysis_id_fkey" FOREIGN KEY ("after_analysis_id") REFERENCES "Analysis" ("analysis_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Result_before_analysis_id_key" ON "Result"("before_analysis_id");

-- CreateIndex
CREATE UNIQUE INDEX "Result_after_analysis_id_key" ON "Result"("after_analysis_id");
