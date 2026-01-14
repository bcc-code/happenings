/**
 * Generate OpenAPI specification
 * Run with: bun src/openapi/generate.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { swaggerSpec } from './config';

const outputPath = join(import.meta.dir, '../../openapi.json');

writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`✅ OpenAPI specification generated at: ${outputPath}`);
