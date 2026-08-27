import { run as runChopper } from './generate-chopper-model.mjs';
import { run as runMetro } from './generate-metro-models.mjs';
import { run as runCoastal } from './generate-coastal-models.mjs';
import { run as runHero } from './upgrade-hero-models.mjs';
import { run as runResidential } from './generate-residential-models.mjs';
import { run as runCommercial } from './generate-commercial-models.mjs';
import { run as runAgricultural } from './generate-agricultural-models.mjs';
import { run as runVehicle } from './generate-vehicle-models.mjs';
import { validateModels } from './model-validator.mjs';

async function main() {
  console.log('='.repeat(70));
  console.log('  SEVERE WEATHER WARNING — ASSET PIPELINE MASTER REBUILD');
  console.log('='.repeat(70));

  console.log('\n[1/8] Generating Chopper Models...');
  if (runChopper) await runChopper();

  console.log('\n[2/8] Generating Metro Row Models...');
  if (runMetro) await runMetro();

  console.log('\n[3/8] Generating Coastal Bayou Models...');
  if (runCoastal) await runCoastal();

  console.log('\n[4/8] Generating Hero Vehicle & Utility Models...');
  if (runHero) await runHero();

  console.log('\n[5/8] Generating Residential Craftsman & Ranch Models...');
  if (runResidential) await runResidential();

  console.log('\n[6/8] Generating Commercial Retail & Warehouse Models...');
  if (runCommercial) await runCommercial();

  console.log('\n[7/8] Generating Agricultural Barns, Grain Silos & Windmills...');
  if (runAgricultural) await runAgricultural();

  console.log('\n[8/8] Generating Vehicle Fleet Models...');
  if (runVehicle) await runVehicle();

  console.log('\nRunning 3D Model Integrity Validator...');
  await validateModels();

  console.log('✓ Master Asset Rebuild Complete!');
}

main().catch(err => {
  console.error('Rebuild failed:', err);
  process.exit(1);
});
