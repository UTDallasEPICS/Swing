const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // optional patient
  const patient = await prisma.patient.create({
    data: { name: 'Test Patient', dob: new Date('1980-01-01') }
  });

  // create two VideoAnalysis rows
  const before = await prisma.videoAnalysis.create({
    data: {
      video: 'before_test.mp4',
      graph_data: { note: 'sample before graph' },
      range_of_motion: 10.5,
      upper_arm_movement: 6.0,
      forearm_movement: 5.0,
      smoothness: -0.2,
      upper_arm_smoothness: -0.1,
      forearm_smoothness: -0.3
    }
  });

  const after = await prisma.videoAnalysis.create({
    data: {
      video: 'after_test.mp4',
      graph_data: { note: 'sample after graph' },
      range_of_motion: 15.0,
      upper_arm_movement: 8.5,
      forearm_movement: 6.5,
      smoothness: -0.05,
      upper_arm_smoothness: -0.02,
      forearm_smoothness: -0.08
    }
  });

  // create TreatmentResult linking before/after
  await prisma.treatmentResult.create({
    data: {
      type_of_treatment: 'demo',
      percent_change_range_of_motion: ((after.range_of_motion - before.range_of_motion) / before.range_of_motion) * 100,
      rom_p_value: 0.12,
      percent_change_of_smoothness: ((after.smoothness - before.smoothness) / Math.abs(before.smoothness || 1)) * 100,
      smoothness_p_value: 0.20,
      patient_id: patient.id,
      before_analysis_id: before.id,
      after_analysis_id: after.id
    }
  });

  console.log('Seed complete');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());