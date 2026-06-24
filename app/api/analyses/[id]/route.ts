import { NextResponse } from "next/server";
import { getAnalysis } from "@/lib/analysis-store";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const analysis = await getAnalysis(params.id);

  if (!analysis) {
    return NextResponse.json({ message: "Analysis not found." }, { status: 404 });
  }

  return NextResponse.json(analysis);
}
