import { NextResponse } from "next/server"
import { createReadStream } from "fs"
import { stat } from "fs/promises"
import path from "path"
import mime from "mime"

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params
    const filePath = path.join(process.cwd(), "uploads", ...resolvedParams.path)
    const fileStat = await stat(filePath)

    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Not a file" }, { status: 404 })
    }

    const range = req.headers.get("range")
    const contentType = mime.getType(filePath) || "application/octet-stream"

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, "").split("-")
      const start = parseInt(startStr, 10)
      const end = endStr ? parseInt(endStr, 10) : fileStat.size - 1
      const chunkSize = end - start + 1

      const stream = createReadStream(filePath, { start, end })

      return new NextResponse(stream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
        },
      })
    }

    // No range → serve full file
    const stream = createReadStream(filePath)
    return new NextResponse(stream, {
      headers: {
        "Content-Length": fileStat.size.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
      },
    })
  } catch (err) {
    console.error("File serving error:", err)
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
