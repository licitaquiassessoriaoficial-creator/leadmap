import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getQueryObject(searchParams: URLSearchParams) {
  return Object.fromEntries(searchParams.entries());
}
