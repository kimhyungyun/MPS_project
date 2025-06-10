import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { id, password, name, email, phoneNumber, nickname } = await request.json();

    // Validate required fields
    if (!id || !password || !name || !email || !phoneNumber || !nickname) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id },
          { email },
          { nickname }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 존재하는 아이디, 이메일 또는 닉네임입니다.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        id,
        password: hashedPassword,
        name,
        email,
        phoneNumber,
        nickname
      }
    });

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다.', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 