export async function GET() {
  return Response.json([{ id: 100 }, { id: 200 }, { id: 300 }])
}