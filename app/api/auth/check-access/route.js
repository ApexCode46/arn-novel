// GET - ตรวจสอบสถานะการเข้าถึง
export async function GET() {
  try {
    // Simple access check without authentication for now
    return Response.json({
      hasAccess: true,
      message: 'Access granted',
      user: null
    })
  } catch (error) {
    console.error('Error checking access:', error)
    return Response.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' },
      { status: 500 }
    )
  }
}
