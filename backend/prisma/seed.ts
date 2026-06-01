import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 3 background preset MVP — product_mockup_canvas_mvp_structure.md §4.3
const TEMPLATES = [
  {
    name: 'White Studio',
    type: 'white-studio',
    // Background layer: warm-white. Frontend đọc canvasJson.background.
    canvasJson: { background: '#fbfbf8', mood: 'soft-daylight' },
  },
  {
    name: 'Minimal Interior',
    type: 'minimal-interior',
    canvasJson: { background: '#ece8e1', mood: 'neutral-premium' },
  },
  {
    name: 'Pastel Sunlight',
    type: 'pastel-sunlight',
    canvasJson: { background: '#fdeede', mood: 'warm-sunlight' },
  },
];

async function main() {
  for (const t of TEMPLATES) {
    const existing = await prisma.mockupTemplate.findFirst({
      where: { type: t.type },
    });
    if (existing) {
      // eslint-disable-next-line no-console
      console.log(`skip ${t.type} (exists)`);
      continue;
    }
    await prisma.mockupTemplate.create({ data: t });
    // eslint-disable-next-line no-console
    console.log(`seeded ${t.type}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
