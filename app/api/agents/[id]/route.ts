import { NextResponse } from "next/server";
import { getMongoDb, type DbAgent } from "@/lib/mongo";
import type { Document } from "mongodb";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getMongoDb();
    const doc = await db.collection<DbAgent>("agents").findOne({ id: params.id }, { projection: { _id: 0 } });
    return NextResponse.json({ agent: doc || null }, { status: 200 });
  } catch {
    return NextResponse.json({ agent: null }, { status: 200 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as Partial<DbAgent>;
    const now = new Date();
    const update: Partial<DbAgent> = {
      name: typeof body.name === "string" ? body.name : undefined,
      purpose: typeof body.purpose === "string" ? body.purpose : undefined,
      context: typeof body.context === "string" ? body.context : undefined,
      updatedAt: now,
    };
    const db = await getMongoDb();
    await db.collection<DbAgent>("agents").updateOne({ id: params.id }, { $set: update });
    // Also reflect changes into saved graphs
    const setOps: Record<string, unknown> = {};
    if (update.name !== undefined) setOps["agents.$[elem].name"] = update.name;
    if (update.purpose !== undefined) setOps["agents.$[elem].purpose"] = update.purpose;
    if (Object.keys(setOps).length > 0) {
      try {
        await db.collection("graphs").updateMany(
          { "agents.id": params.id },
          { $set: setOps },
          { arrayFilters: [{ "elem.id": params.id }] as Document[] }
        );
      } catch {}
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const db = await getMongoDb();
    await db.collection("agents").deleteOne({ id: params.id });
    // Also remove from default graph if present
    // Use aggregation-style updates to avoid TS PullOperator typing issues
    await db.collection("graphs").updateOne(
      { id: "default" },
      [{ $set: { agents: { $filter: { input: "$agents", as: "a", cond: { $ne: ["$$a.id", params.id] } } } } } as unknown as Document]
    );
    await db.collection("graphs").updateOne(
      { id: "default" },
      [{ $set: { edges: { $filter: { input: "$edges", as: "e", cond: { $and: [{ $ne: ["$$e.source", params.id] }, { $ne: ["$$e.target", params.id] }] } } } } } as unknown as Document]
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 });
  }
}


