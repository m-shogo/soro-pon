import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FIXTURES_ROOT = join(__dirname, '..', '..', '..', 'fixtures');
const SAMPLES_ROOT = join(__dirname, '..', '..', '..', 'samples');

export function loadFixtureText(relativePath: string): string {
  return readFileSync(join(FIXTURES_ROOT, relativePath), 'utf-8');
}

export function loadFixtureJson(relativePath: string): unknown {
  return JSON.parse(loadFixtureText(relativePath)) as unknown;
}

export function loadSampleText(fileName: string): string {
  return readFileSync(join(SAMPLES_ROOT, fileName), 'utf-8');
}
