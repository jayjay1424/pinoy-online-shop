#!/usr/bin/env node
/**
 * Meshy AI 3D Generative API Client & Automation Pipeline
 * Official integration script for the 3d-modeling-mastery skill.
 *
 * Endpoints:
 * - Image-to-3D: POST https://api.meshy.ai/openapi/v1/image-to-3d
 * - Task Polling: GET https://api.meshy.ai/openapi/v1/{endpoint}/{task_id}
 * - Text-to-3D:  POST https://api.meshy.ai/openapi/v1/text-to-3d
 * - Multi-Image: POST https://api.meshy.ai/openapi/v1/multi-image-to-3d
 * - Retexture:   POST https://api.meshy.ai/openapi/v1/retexture
 * - Remesh:      POST https://api.meshy.ai/openapi/v1/remesh
 */

import fs from 'fs';
import path from 'path';

// 1. Resolve API Key from Environment or .env
export function getMeshyApiKey() {
  if (process.env.MESHY_API_KEY) {
    return process.env.MESHY_API_KEY.trim();
  }

  // Look for .env in current directory or project root
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
    path.resolve(process.cwd(), '..', '..', '.env')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^MESHY_API_KEY\s*=\s*(.+)$/m);
      if (match) {
        return match[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }

  return null;
}

const MESHY_BASE_URL = 'https://api.meshy.ai/openapi/v1';

/**
 * 2. Create Image-to-3D Task
 * Accepts a public image URL or local file path (automatically converted to data URI).
 */
export async function createImageTo3d(imageInput, options = {}) {
  const apiKey = getMeshyApiKey();
  if (!apiKey) {
    throw new Error('MESHY_API_KEY not found. Set the MESHY_API_KEY environment variable or add it to .env.');
  }

  let imageUrl = imageInput;

  // Handle local file paths by converting to Base64 data URI
  if (!imageInput.startsWith('http://') && !imageInput.startsWith('https://') && !imageInput.startsWith('data:')) {
    const resolvedPath = path.resolve(process.cwd(), imageInput);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Local image file not found at: ${resolvedPath}`);
    }
    const ext = path.extname(resolvedPath).toLowerCase().replace('.', '') || 'png';
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
    const fileBuffer = fs.readFileSync(resolvedPath);
    imageUrl = `data:${mime};base64,${fileBuffer.toString('base64')}`;
    console.log(`[Meshy Client] Converted local file (${(fileBuffer.length / 1024).toFixed(1)} KB) to Base64 data URI.`);
  }

  const payload = {
    image_url: imageUrl,
    enable_pbr: options.enable_pbr !== false,
    surface_mode: options.surface_mode || 'organic',
    ...options
  };

  console.log(`[Meshy Client] Initiating Image-to-3D task via ${MESHY_BASE_URL}/image-to-3d...`);

  const response = await fetch(`${MESHY_BASE_URL}/image-to-3d`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Meshy API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  console.log(`[Meshy Client] Task created successfully. Task ID: ${data.result}`);
  return data.result; // Returns the task ID
}

/**
 * 3. Poll Task Status until Succeeded or Failed
 */
export async function pollMeshyTask(taskId, endpoint = 'image-to-3d', intervalMs = 4000, maxWaitMs = 600000) {
  const apiKey = getMeshyApiKey();
  if (!apiKey) {
    throw new Error('MESHY_API_KEY not found.');
  }

  const startTime = Date.now();
  console.log(`[Meshy Client] Polling task ${taskId} every ${intervalMs / 1000}s...`);

  while (Date.now() - startTime < maxWaitMs) {
    const response = await fetch(`${MESHY_BASE_URL}/${endpoint}/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Polling error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const status = data.status;
    const progress = data.progress !== undefined ? `${data.progress}%` : 'running';

    console.log(`[Meshy Client] Status: ${status} | Progress: ${progress}`);

    if (status === 'SUCCEEDED') {
      console.log(`[Meshy Client] Generation succeeded!`);
      return data;
    }

    if (status === 'FAILED') {
      const taskError = data.task_error ? JSON.stringify(data.task_error) : 'Unknown error';
      throw new Error(`Meshy task failed: ${taskError}`);
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Meshy task ${taskId} timed out after ${maxWaitMs / 1000} seconds.`);
}

/**
 * 4. Download 3D Model Asset (GLB / Textures) to Disk
 */
export async function downloadAsset(url, outputPath) {
  console.log(`[Meshy Client] Downloading ${url} to ${outputPath}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download asset from ${url}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`[Meshy Client] Saved asset (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) to ${outputPath}`);
  return outputPath;
}

/**
 * 5. Full End-to-End Image-to-3D Execution
 */
export async function runImageTo3dPipeline(imageInput, outputGlbPath, options = {}) {
  console.log('================================================================');
  console.log('MESHY AI GENERATIVE 3D PIPELINE: IMAGE-TO-3D');
  console.log('================================================================');
  
  // Step 1: Create Task
  const taskId = await createImageTo3d(imageInput, options);

  // Step 2: Poll Task
  const result = await pollMeshyTask(taskId, 'image-to-3d', options.intervalMs || 4000);

  // Step 3: Download GLB
  const glbUrl = result.model_urls?.glb;
  if (!glbUrl) {
    throw new Error('No GLB URL found in task result: ' + JSON.stringify(result));
  }

  const savedPath = await downloadAsset(glbUrl, outputGlbPath);
  console.log(`[Meshy Client] Pipeline complete! Output model: ${savedPath}`);

  return {
    taskId,
    glbPath: savedPath,
    modelUrls: result.model_urls,
    thumbnailUrl: result.thumbnail_url
  };
}

/**
 * 6. Other Endpoints (Text-to-3D, Multi-Image, Retexture, Remesh)
 */
export async function createTextTo3d(prompt, options = {}) {
  const apiKey = getMeshyApiKey();
  if (!apiKey) throw new Error('MESHY_API_KEY not found.');

  const payload = {
    prompt,
    art_style: options.art_style || 'realistic',
    enable_pbr: options.enable_pbr !== false,
    ...options
  };

  const response = await fetch(`${MESHY_BASE_URL}/text-to-3d`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return data.result;
}

export async function createMultiImageTo3d(imageUrls, options = {}) {
  const apiKey = getMeshyApiKey();
  if (!apiKey) throw new Error('MESHY_API_KEY not found.');

  const payload = {
    image_urls: imageUrls,
    enable_pbr: options.enable_pbr !== false,
    ...options
  };

  const response = await fetch(`${MESHY_BASE_URL}/multi-image-to-3d`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return data.result;
}

// 7. CLI Runner
if (process.argv[1] && process.argv[1].endsWith('meshy_client.mjs')) {
  const [,, command, input, outputName] = process.argv;

  if (!command) {
    console.log(`
Meshy AI Generative 3D CLI:
Usage:
  node meshy_client.mjs image <image_path_or_url> [output_glb_name]
  node meshy_client.mjs text "<prompt>" [output_glb_name]
  node meshy_client.mjs poll <task_id> [output_glb_name]

Example:
  node meshy_client.mjs image public/textures/meshy_jacket.png barong_woven
    `);
    process.exit(0);
  }

  const outName = outputName || 'generated_model';
  const outPath = path.resolve(process.cwd(), 'public', 'models', `${outName}.glb`);

  if (command === 'image') {
    runImageTo3dPipeline(input, outPath)
      .then(() => process.exit(0))
      .catch(err => {
        console.error('Error executing image-to-3d:', err.message);
        process.exit(1);
      });
  } else if (command === 'poll') {
    pollMeshyTask(input, 'image-to-3d')
      .then(async res => {
        if (res.model_urls?.glb) {
          await downloadAsset(res.model_urls.glb, outPath);
        }
        process.exit(0);
      })
      .catch(err => {
        console.error('Error polling task:', err.message);
        process.exit(1);
      });
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

