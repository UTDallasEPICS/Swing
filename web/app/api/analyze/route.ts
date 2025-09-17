import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';

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