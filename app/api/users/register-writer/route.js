import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

// POST - สมัครเป็นนักเขียน
export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    // ค้นหาผู้ใช้จาก email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { registerWriter: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      )
    }

    // ตรวจสอบว่าสมัครแล้วหรือยัง
    if (user.registerWriter) {
      // ถ้าสถานะเป็น rejected ให้สามารถส่งใหม่ได้
      if (user.registerWriter.status !== 'rejected') {
        return NextResponse.json(
          { error: 'คุณได้สมัครเป็นนักเขียนแล้ว' },
          { status: 400 }
        )
      }
    }

    const formData = await request.formData()
    
    const realName = formData.get('realName')
    const numIdCard = formData.get('numIdCard')
    const email = formData.get('email')
    const phoneNumber = formData.get('phoneNumber')
    const numBank = formData.get('numBank')
    const IdCardFile = formData.get('IdCard')
    const SelfieWithIdCardFile = formData.get('SelfieWithIdCard')
    const BankAccountFile = formData.get('BankAccount')

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!realName || !numIdCard || !email || !phoneNumber || !numBank) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    if (!IdCardFile || !SelfieWithIdCardFile || !BankAccountFile) {
      return NextResponse.json(
        { error: 'กรุณาอัปโหลดรูปภาพให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // ฟังก์ชันสำหรับลบไฟล์เก่า
    const deleteOldFile = async (filePath) => {
      if (filePath) {
        const fullPath = path.join(process.cwd(), 'public', filePath.substring(1)) // ตัด / ออกจากหน้า
        if (existsSync(fullPath)) {
          try {
            await unlink(fullPath)
            console.log(`Deleted old file: ${fullPath}`)
          } catch (error) {
            console.error(`Error deleting file ${fullPath}:`, error)
          }
        }
      }
    }

    // ฟังก์ชันสำหรับบันทึกไฟล์
    const saveFile = async (file, directory) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const timestamp = Date.now()
      const fileName = `${timestamp}_${file.name}`
      const dirPath = path.join(process.cwd(), 'public', directory)
      const filePath = path.join(dirPath, fileName)
      
      // สร้างโฟลเดอร์ถ้ายังไม่มี
      await mkdir(dirPath, { recursive: true })
      
      // เขียนไฟล์
      await writeFile(filePath, buffer)
      
      return `/${directory}/${fileName}`
    }

    // บันทึกไฟล์
    const IdCardPath = await saveFile(IdCardFile, 'IDCard')
    const SelfieWithIdCardPath = await saveFile(SelfieWithIdCardFile, 'SelfiewithIDcard')
    const BankAccountPath = await saveFile(BankAccountFile, 'BankAccount')

    // บันทึกข้อมูลลงฐานข้อมูล
    let registerWriter
    if (user.registerWriter && user.registerWriter.status === 'rejected') {
      // ลบไฟล์เก่าก่อนอัปเดต
      await deleteOldFile(user.registerWriter.IdCard)
      await deleteOldFile(user.registerWriter.SelfieWithIdCard)
      await deleteOldFile(user.registerWriter.BankAccount)

      // อัปเดตข้อมูลสำหรับกรณีที่ถูกปฏิเสธแล้ว
      registerWriter = await prisma.registerWriter.update({
        where: { registerWriter_id: user.registerWriter.registerWriter_id },
        data: {
          realName,
          IdCard: IdCardPath,
          SelfieWithIdCard: SelfieWithIdCardPath,
          numIdCard,
          email,
          phoneNumber,
          BankAccount: BankAccountPath,
          numBank,
          status: 'pending' // เปลี่ยนกลับเป็นรอการอนุมัติ
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    } else {
      // สร้างข้อมูลใหม่
      registerWriter = await prisma.registerWriter.create({
        data: {
          user_id: user.id,
          realName,
          IdCard: IdCardPath,
          SelfieWithIdCard: SelfieWithIdCardPath,
          numIdCard,
          email,
          phoneNumber,
          BankAccount: BankAccountPath,
          numBank,
          status: 'pending' // สถานะรอการอนุมัติ
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    }

    return NextResponse.json({
      message: user.registerWriter && user.registerWriter.status === 'rejected' 
        ? 'ส่งคำขอสมัครใหม่เรียบร้อย รอการอนุมัติจากผู้ดูแลระบบ'
        : 'ส่งคำขอสมัครเป็นนักเขียนเรียบร้อย รอการอนุมัติจากผู้ดูแลระบบ',
      data: registerWriter
    })

  } catch (error) {
    console.error('Error registering writer:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการส่งคำขอ' },
      { status: 500 }
    )
  }
}

// GET - ตรวจสอบสถานะการสมัคร
export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        registerWriter: true 
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      hasApplied: !!user.registerWriter,
      application: user.registerWriter
    })

  } catch (error) {
    console.error('Error checking writer status:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบสถานะ' },
      { status: 500 }
    )
  }
}
