// app/api/test-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/email.service';

export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Testing only available in development' }, { status: 403 });
  }

  const testEmail = req.nextUrl.searchParams.get('email');
  
  if (!testEmail) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  // Test configuration first
  const configTest = await EmailService.testConfig();
  if (!configTest.success) {
    return NextResponse.json({ 
      success: false, 
      message: configTest.error,
      tip: 'Check your EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS in .env.local'
    }, { status: 500 });
  }

  // Send test OTP
  const result = await EmailService.sendOTP(testEmail, '123456');
  
  return NextResponse.json({
    success: result.success,
    message: result.success ? 'Test email sent! Check your inbox.' : result.error,
  });
}