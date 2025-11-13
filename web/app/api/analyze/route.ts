import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';
//get handler
export async function GET(request: Request) {
  try {
    //create url object, allows to extract query params
    const url = new URL(request.url);
    //get params from query string, if not provided then defaults
    const page = Number(url.searchParams.get('page') ?? 1);
    const perPage = Math.min(100, Number(url.searchParams.get('perPage') ?? 25));
    //calcs how many items to skip based on page num
    const skip = (Math.max(1, page) - 1) * perPage;
    //runs both queries at the same time: get patient records, count total num of patient records in the table
    const [items, total] = await Promise.all([
      prisma.patient.findMany({
        skip,
        take: perPage,
        orderBy: { id: 'desc' },
      }),
      prisma.patient.count(),
    ]);
    //return paginated data and meta info
    return NextResponse.json({ items, total, page, perPage });
  } catch (e) { //error response
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
//put handler
export async function PUT(request: Request) {
  try {
    //parse json body
    const body = await request.json();
    //validate id
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    //perform update 
    const updated = await prisma.patient.update({
      where: { id: Number(body.id) }, //which record to update
      data: { //fields to be modified
        name: body.name,
        dob: body.dob ? new Date(body.dob) : null,
      },
    });
    return NextResponse.json(updated); //return updated record
  } catch (e) { //error response
    console.error(e);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}
//delete handler, safely deletes patient record
export async function DELETE(request: Request) {
  try {
    //parse json body
    const body = await request.json(); 
    //validate id
    if (!body.id) return NextResponse.json({error: 'Missing id'}, {status: 400});
    //attempt to delete patient record, if does not exist throw error
    const deleted = await prisma.patient.delete({where: { id: Number(body.is)}});
    //return deleted record
    return NextResponse.json(deleted);
  } catch (e) { //error response
    console.error(e);
    return NextResponse.json({error: 'Failed to delete patient'}, {status: 500});
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const beforeVideo = formData.get('beforeVideo') as File;
    const afterVideo = formData.get('afterVideo') as File;

    if (!beforeVideo || !afterVideo) {
      return NextResponse.json({
        success: false,
        message: 'Both videos are required'
      }, { status: 400 });
    }

    // Get the project root directory (go up three levels from web/app/api/analyze)
    const projectRoot = path.resolve(process.cwd(), '..');
    console.log('Project root:', projectRoot);

    // Create temporary directory for processing
    const tempDir = path.join(projectRoot, 'tmp');
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('Temp directory:', tempDir);

    // Save uploaded files
    const beforePath = path.join(tempDir, 'before.mp4');
    const afterPath = path.join(tempDir, 'after.mp4');
    const beforeBuffer = Buffer.from(await beforeVideo.arrayBuffer());
    const afterBuffer = Buffer.from(await afterVideo.arrayBuffer());
    await writeFile(beforePath, beforeBuffer);
    await writeFile(afterPath, afterBuffer);
    console.log('Saved video files:', { beforePath, afterPath });

    // Create output directory
    const outputDir = path.join(tempDir, 'analysis_output');
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('Output directory:', outputDir);

    // Run analysis for both videos in parallel
    const beforeOutput = path.join(outputDir, 'before_analysis.png');
    const afterOutput = path.join(outputDir, 'after_analysis.png');
    const beforeJson = path.join(outputDir, 'before_analysis.json');
    const afterJson = path.join(outputDir, 'after_analysis.json');

    // Get the path to the Python scripts
    const analyzeScriptPath = path.join(projectRoot, 'ml', 'analyze_video.py');
    const improveScriptPath = path.join(projectRoot, 'ml', 'analyze_improvement.py');
    console.log('Python script paths:', { analyzeScriptPath, improveScriptPath });

    // Verify scripts exist
    if (!fs.existsSync(analyzeScriptPath)) {
      throw new Error(`Analysis script not found at: ${analyzeScriptPath}`);
    }
    if (!fs.existsSync(improveScriptPath)) {
      throw new Error(`Improvement analysis script not found at: ${improveScriptPath}`);
    }

    // Get Python executable path
    const pythonPath = process.env.PYTHON_PATH || 'python';
    console.log('Using Python:', pythonPath);

    // Function to run video analysis
    const runVideoAnalysis = (videoPath: string, outputPath: string) => {
      return new Promise((resolve, reject) => {
        const pythonProcess = spawn(pythonPath, [
          analyzeScriptPath,
          videoPath,
          outputPath
        ], {
          cwd: projectRoot
        });

        pythonProcess.stdout.on('data', (data) => {
          console.log(`Python stdout: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
          console.error(`Python stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
          if (code === 0) resolve(null);
          else reject(new Error(`Python process exited with code ${code}`));
        });
      });
    };

    // Run both video analyses in parallel
    try {
      await Promise.all([
        runVideoAnalysis(beforePath, beforeOutput),
        runVideoAnalysis(afterPath, afterOutput)
      ]);
    } catch (error) {
      console.error('Error during video analysis:', error);
      throw error;
    }

    // Run the improvement analysis
    const improvementOutput = path.join(outputDir, 'improvement_analysis.json');
    await new Promise((resolve, reject) => {
      const pythonProcess = spawn(pythonPath, [
        improveScriptPath,
        beforeJson,
        afterJson,
        improvementOutput
      ], {
        cwd: projectRoot
      });

      pythonProcess.stdout.on('data', (data) => {
        console.log(`Python stdout: ${data}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) resolve(null);
        else reject(new Error(`Python process exited with code ${code}`));
      });
    });

    // Create a unique ID for this analysis
    const analysisId = Date.now().toString();

    // Create a directory for this analysis in the web/public directory
    const publicDir = path.join(process.cwd(), 'public');
    const analysisDir = path.join(publicDir, 'analysis', analysisId);
    fs.mkdirSync(analysisDir, { recursive: true });
    console.log('Created analysis directory:', analysisDir);

    // Copy the analysis results to the public directory
    const publicBeforeOutput = path.join(analysisDir, 'before_analysis.png');
    const publicAfterOutput = path.join(analysisDir, 'after_analysis.png');
    const publicImprovementOutput = path.join(analysisDir, 'improvement_analysis.json');
    
    // Verify the output files exist before copying
    if (!fs.existsSync(beforeOutput)) {
      throw new Error(`Before analysis output not found at: ${beforeOutput}`);
    }
    if (!fs.existsSync(afterOutput)) {
      throw new Error(`After analysis output not found at: ${afterOutput}`);
    }
    if (!fs.existsSync(improvementOutput)) {
      throw new Error(`Improvement analysis output not found at: ${improvementOutput}`);
    }

    fs.copyFileSync(beforeOutput, publicBeforeOutput);
    fs.copyFileSync(afterOutput, publicAfterOutput);
    fs.copyFileSync(improvementOutput, publicImprovementOutput);
    console.log('Copied analysis results to:', { publicBeforeOutput, publicAfterOutput, publicImprovementOutput });
    
    // prisma writes
    try {
      const beforePose = JSON.parse(fs.readFileSync(beforeJson, 'utf-8'));
      const afterPose = JSON.parse(fs.readFileSync(afterJson, 'utf-8'));
      const improvement = JSON.parse(fs.readFileSync(improvementOutput, 'utf-8'));

      // Prefer summaries emitted by analyze_improvement.py; fall back to minimal defaults
      const beforeSummary = improvement.before_summary ?? { ranges: { UpperArm: 0, Forearm: 0 }, smoothness: { UpperArm: 0, Forearm: 0 } };
      const afterSummary = improvement.after_summary ?? { ranges: { UpperArm: 0, Forearm: 0 }, smoothness: { UpperArm: 0, Forearm: 0 } };

      const beforeRangeAvg = (Number(beforeSummary.ranges.UpperArm) + Number(beforeSummary.ranges.Forearm)) / 2;
      const afterRangeAvg = (Number(afterSummary.ranges.UpperArm) + Number(afterSummary.ranges.Forearm)) / 2;
      const beforeSmoothAvg = (Number(beforeSummary.smoothness.UpperArm) + Number(beforeSummary.smoothness.Forearm)) / 2;
      const afterSmoothAvg = (Number(afterSummary.smoothness.UpperArm) + Number(afterSummary.smoothness.Forearm)) / 2;

      // Create VideoAnalysis rows
      const beforeAnalysis = await prisma.videoAnalysis.create({
        data: {
          video: path.basename(beforePath),
          graph_data: beforePose,
          range_of_motion: Number(beforeRangeAvg),
          upper_arm_movement: Number(beforeSummary.ranges.UpperArm),
          forearm_movement: Number(beforeSummary.ranges.Forearm),
          smoothness: Number(beforeSmoothAvg),
          upper_arm_smoothness: Number(beforeSummary.smoothness.UpperArm),
          forearm_smoothness: Number(beforeSummary.smoothness.Forearm)
        }
      });

      const afterAnalysis = await prisma.videoAnalysis.create({
        data: {
          video: path.basename(afterPath),
          graph_data: afterPose,
          range_of_motion: Number(afterRangeAvg),
          upper_arm_movement: Number(afterSummary.ranges.UpperArm),
          forearm_movement: Number(afterSummary.ranges.Forearm),
          smoothness: Number(afterSmoothAvg),
          upper_arm_smoothness: Number(afterSummary.smoothness.UpperArm),
          forearm_smoothness: Number(afterSummary.smoothness.Forearm)
        }
      });

      // Compute percent changes (safe divide)
      const safeDiv = (a: number, b: number) => b === 0 ? 0 : (a - b) / Math.abs(b);
      const percentChangeROM = safeDiv(afterRangeAvg, beforeRangeAvg) * 100;
      const percentChangeSmooth = safeDiv(afterSmoothAvg, beforeSmoothAvg) * 100;

      // Pull example p-values from improvement statistics if present; default to 1.0
      const romPValue = Number(improvement.statistics?.range_of_motion?.upper_arm?.p_value ?? improvement.statistics?.range_of_motion?.p_value ?? 1.0);
      const smoothPValue = Number(improvement.statistics?.smoothness?.upper_arm?.p_value ?? improvement.statistics?.smoothness?.p_value ?? 1.0);

      // Create TreatmentResult row linking the two analyses
      await prisma.treatmentResult.create({
        data: {
          type_of_treatment: null,
          percent_change_range_of_motion: Number(percentChangeROM),
          rom_p_value: romPValue,
          percent_change_of_smoothness: Number(percentChangeSmooth),
          smoothness_p_value: smoothPValue,
          patient_id: null,
          before_analysis_id: beforeAnalysis.id,
          after_analysis_id: afterAnalysis.id
        }
      });

      console.log('Inserted analysis rows into DB:', { beforeAnalysisId: beforeAnalysis.id, afterAnalysisId: afterAnalysis.id });
    } catch (dbErr) {
      console.error('Error inserting into DB:', dbErr);
    } finally {
      // disconnect Prisma client after DB work
      try { await prisma.$disconnect(); } catch (e) { /* ignore */ }
    }
    // Clean up temporary files
    fs.unlinkSync(beforePath);
    fs.unlinkSync(afterPath);
    fs.unlinkSync(beforeOutput);
    fs.unlinkSync(afterOutput);
    fs.unlinkSync(beforeJson);
    fs.unlinkSync(afterJson);
    fs.unlinkSync(improvementOutput);
    fs.rmdirSync(outputDir);

    // Return URLs to the analysis results
    return NextResponse.json({
      success: true,
      beforeResult: `/analysis/${analysisId}/before_analysis.png`,
      afterResult: `/analysis/${analysisId}/after_analysis.png`,
      improvementResult: `/analysis/${analysisId}/improvement_analysis.json`
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred during analysis'
    }, { status: 500 });
  }
} 