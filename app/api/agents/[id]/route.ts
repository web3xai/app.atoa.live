import { NextResponse } from "next/server";
import { getMongoDb, type DbAgent } from "@/lib/mongo";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getMongoDb();
    const doc = await db.collection<DbAgent>("agents").findOne({ id }, { projection: { _id: 0 } });
    return NextResponse.json({ agent: doc || null }, { status: 200 });
  } catch {
    return NextResponse.json({ agent: null }, { status: 200 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<DbAgent>;
    const now = new Date();
    const update: Partial<DbAgent> = {
      name: typeof body.name === "string" ? body.name : undefined,
      purpose: typeof body.purpose === "string" ? body.purpose : undefined,
      context: typeof body.context === "string" ? body.context : undefined,
      updatedAt: now,
    };
    const db = await getMongoDb();
    await db.collection<DbAgent>("agents").updateOne({ id }, { $set: update });
    // Also reflect changes into saved graphs
    const setOps: Record<string, unknown> = {};
    if (update.name !== undefined) setOps["agents.$[elem].name"] = update.name;
    if (update.purpose !== undefined) setOps["agents.$[elem].purpose"] = update.purpose;
    if (Object.keys(setOps).length > 0) {
      try {
        await db.collection("graphs").updateMany(
          { "agents.id": id },
          { $set: setOps },
          { arrayFilters: [{ "elem.id": id }] }
        );
      } catch {}
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getMongoDb();
    await db.collection("agents").deleteOne({ id });
    // Also remove from default graph if present
    await db.collection("graphs").updateOne(
      { id: "default" },
      { $pull: { agents: { id } } } as Record<string, unknown>
    );
    await db.collection("graphs").updateOne(
      { id: "default" },
      { $pull: { edges: { source: id } } } as Record<string, unknown>
    );
    await db.collection("graphs").updateOne(
      { id: "default" },
      { $pull: { edges: { target: id } } } as Record<string, unknown>
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }
}


