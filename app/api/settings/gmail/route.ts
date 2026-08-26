import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Setting from '@/models/Setting';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, clientId, clientSecret, appPassword, type } = body;

    // Validate that we have some auth info
    if (!email || (!appPassword && (!clientId || !clientSecret))) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin xác thực (appPassword hoặc clientId/clientSecret)' },
        { status: 400 }
      );
    }

    // Save or update the Gmail setting
    const setting = await Setting.findOneAndUpdate(
      { key: 'gmail_config' },
      { 
        value: { 
          email, 
          type: type || (appPassword ? 'app_password' : 'oauth2'),
          clientId, 
          clientSecret, 
          appPassword 
        } 
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const setting = await Setting.findOne({ key: 'gmail_config' });
    
    if (!setting) {
      return NextResponse.json({ success: true, data: null });
    }
    
    // Optional: Only return partial data for security if needed (e.g. mask the password/secret)
    return NextResponse.json({ success: true, data: setting.value });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
