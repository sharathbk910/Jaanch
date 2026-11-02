import { execFile } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { logger } from './logger.js';

const execFileAsync = promisify(execFile);

export interface ScamModelEvaluation {
  confidence: number;
  severity: 'medium' | 'low' | 'none';
  signal: 'possible_scam_pattern' | null;
}

const ROOT_DIR = path.resolve(process.cwd());
const PYTHON_PATH_VENV = path.join(ROOT_DIR, '.venv', 'Scripts', 'python.exe');
const EVAL_SCRIPT_PATH = path.join(ROOT_DIR, 'models', 'evaluate.py');
const MICROSERVICE_URL = process.env.ML_MODEL_URL || 'http://127.0.0.1:5001/evaluate';

/**
 * Evaluates raw job offer text using the calibrated scikit-learn model.
 * 1. Attempts HTTP microservice first (fast <20ms in-memory cache)
 * 2. Falls back to python subprocess if microservice is offline
 * 3. Gracefully returns null if Python/model is not installed
 */
export async function evaluateJobTextWithML(text: string = ''): Promise<ScamModelEvaluation | null> {
  if (!text || text.trim().length === 0) {
    return {
      confidence: 0,
      severity: 'none',
      signal: null,
    };
  }

  // 1. Try microservice if running
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600);
    const res = await fetch(MICROSERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as ScamModelEvaluation;
      return data;
    }
  } catch {
    // Microservice not running; continue to subprocess fallback
  }

  // 2. Subprocess fallback
  try {
    const pythonExe = fs.existsSync(PYTHON_PATH_VENV) ? PYTHON_PATH_VENV : 'python';
    if (!fs.existsSync(EVAL_SCRIPT_PATH)) {
      return null;
    }

    const { stdout } = await execFileAsync(pythonExe, [EVAL_SCRIPT_PATH, text], {
      timeout: 4000,
      maxBuffer: 1024 * 1024,
      cwd: ROOT_DIR,
    });

    const parsed = JSON.parse(stdout.trim()) as ScamModelEvaluation;
    return parsed;
  } catch (err) {
    logger.debug({ err }, 'ML scam model evaluation fallback skipped');
    return null;
  }
}
