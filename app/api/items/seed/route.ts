import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Item } from "@/lib/models/Item";

// Items based on the provided table
const SEED_ITEMS: Array<{
  name: string;
  unitPacking?: string; // Size
  per?: string; // e.g., Roll/Than/Pkt
}> = [
  { name: "Absorbent Cotton Wool IP", unitPacking: "500 gm", per: "Pkt" },
  {
    name: "Absorbent Gauze Cloth Sch F II",
    unitPacking: "90cm x 18mtrs",
    per: "Than",
  },
  {
    name: "Absorbent Gauze Cloth Sch F II",
    unitPacking: "50cm x 18mtrs",
    per: "Than",
  },
  {
    name: "Bandage Cloth Sch F II",
    unitPacking: "100cm x 20 mtrs",
    per: "Than",
  },
  {
    name: "Rolled bandage Sch F II",
    unitPacking: "7.5 cm x 4mtrs",
    per: "Than",
  },
  {
    name: "Rolled bandage Sch F II",
    unitPacking: "10 cm x 4mtrs",
    per: "Roll",
  },
  {
    name: "Rolled bandage Sch F II",
    unitPacking: "15 cm x 4mtrs",
    per: "Roll",
  },
  {
    name: "Plaster of Paris Bandage (BP)",
    unitPacking: "10 cm x 2.7mtrs",
    per: "Roll",
  },
  {
    name: "Plaster of Paris Bandage (BP)",
    unitPacking: "15 cm x 2.7mtrs",
    per: "Roll",
  },
  {
    name: "Cotton Crepe Bandage (BP)",
    unitPacking: "10 cm x 2.7mtrs",
    per: "Roll",
  },
  {
    name: "Cotton Crepe Bandage (BP)",
    unitPacking: "15 cm x 2.7mtrs",
    per: "Roll",
  },
  {
    name: "Elastic Adhesive bandages",
    unitPacking: "10 cm x 4mtrs",
    per: "Roll",
  },
];

async function seedItems() {
  await connectDB();

  let inserted = 0;
  for (const seed of SEED_ITEMS) {
    // Use name + unitPacking as identity; do not overwrite existing price/details
    const existing = await Item.findOne({
      name: seed.name,
      unitPacking: seed.unitPacking,
    });
    if (existing) continue;

    await Item.create({
      name: seed.name,
      description: seed.per ? `Per: ${seed.per}` : undefined,
      category: "Medical Supplies",
      unitPrice: 0,
      unitPacking: seed.unitPacking,
      hsnCode: undefined,
      gstRate: undefined,
      isActive: true,
    });
    inserted++;
  }

  return { inserted };
}

export async function GET() {
  try {
    const { inserted } = await seedItems();
    const total = await Item.countDocuments();
    return NextResponse.json({ success: true, inserted, total });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST() {
  // POST does the same as GET for convenience
  return GET();
}
