//changed
import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { writeFile } from "fs/promises";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const beforeVideo = formData.get("beforeVideo") as File;
    const afterVideo = formData.get("afterVideo") as File;

    if (!beforeVideo || !afterVideo) {
      return NextResponse.json(
        { success: false, message: "Both videos are required" },
        { status: 400 }
      );
    }

    const projectRoot = path.resolve(process.cwd(), "..");
    const tempDir = path.join(projectRoot, "tmp");
    fs.mkdirSync(tempDir, { recursive: true });

    const beforePath = path.join(tempDir, "before.mp4");
    const afterPath = path.join(tempDir, "after.mp4");
    await writeFile(beforePath, Buffer.from(await beforeVideo.arrayBuffer()));
    await writeFile(afterPath, Buffer.from(await afterVideo.arrayBuffer()));

    const outputDir = path.join(tempDir, "analysis_output");
    fs.mkdirSync(outputDir, { recursive: true });

    const beforeOutput = path.join(outputDir, "before_analysis.png");
    const afterOutput = path.join(outputDir, "after_analysis.png");
    const beforeJson = path.join(outputDir, "before_analysis.json");
    const afterJson = path.join(outputDir, "after_analysis.json");

    const analyzeScriptPath = path.join(projectRoot, "ml", "analyze_video.py");
    const improveScriptPath = path.join(projectRoot, "ml", "analyze_improvement.py");

    const pythonPath = process.env.PYTHON_PATH || "python";

    const runVideoAnalysis = (videoPath: string, outputPath: string) => {
      return new Promise((resolve, reject) => {
        const p = spawn(pythonPath, [analyzeScriptPath, videoPath, outputPath], {
          cwd: projectRoot,
        });

        p.stdout.on("data", (d) => console.log(`PY: ${d}`));
        p.stderr.on("data", (d) => console.error(`PY ERR: ${d}`));

        p.on("close", (code) => {
          if (code !== 0) {
            console.error("❌ PYTHON FAILED");
            return reject(new Error(`Python exit code ${code}`));
          }
          return resolve(null);
        });
      });
    };

    await runVideoAnalysis(beforePath, beforeOutput);
    if (!fs.existsSync(beforeJson)) throw new Error("before_analysis.json missing.");

    await runVideoAnalysis(afterPath, afterOutput);
    if (!fs.existsSync(afterJson)) throw new Error("after_analysis.json missing.");

    const improvementOutput = path.join(outputDir, "improvement_analysis.json");

    await new Promise((resolve, reject) => {
      const p = spawn(
        pythonPath,
        [improveScriptPath, beforeJson, afterJson, improvementOutput],
        { cwd: projectRoot }
      );

      p.stdout.on("data", (d) => console.log(`PY IMP: ${d}`));
      p.stderr.on("data", (d) => console.error(`PY IMP ERR: ${d}`));

      p.on("close", (code) => {
        if (code !== 0) {
          console.error("❌ IMPROVEMENT FAILED");
          return reject(new Error(`Improvement exit code ${code}`));
        }
        return resolve(null);
      });
    });

    if (!fs.existsSync(improvementOutput))
      throw new Error("improvement_analysis.json missing.");

    const analysisId = Date.now().toString();
    const analysisDir = path.join(process.cwd(), "public", "analysis", analysisId);
    fs.mkdirSync(analysisDir, { recursive: true });

    fs.copyFileSync(beforeOutput, path.join(analysisDir, "before_analysis.png"));
    fs.copyFileSync(afterOutput, path.join(analysisDir, "after_analysis.png"));
    fs.copyFileSync(improvementOutput, path.join(analysisDir, "improvement_analysis.json"));

    return NextResponse.json({
      success: true,
      beforeResult: `/analysis/${analysisId}/before_analysis.png`,
      afterResult: `/analysis/${analysisId}/after_analysis.png`,
      improvementResult: `/analysis/${analysisId}/improvement_analysis.json`,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
