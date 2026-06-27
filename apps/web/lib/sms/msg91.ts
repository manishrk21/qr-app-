/**
 * MSG91 SMS Service
 * Handles OTP delivery via MSG91 API
 */

type SendOTPResponse = {
  success: boolean;
  requestId?: string;
  error?: string;
};

export async function sendOTPViaMSG91(
  phoneNumber: string,
  otp: string,
  restaurantName: string
): Promise<SendOTPResponse> {
  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    const senderId = process.env.MSG91_SENDER_ID || "MENUFLOW";

    if (!authKey || !templateId) {
      console.error("MSG91 configuration missing");
      return {
        success: false,
        error: "SMS service not configured"
      };
    }

    // Ensure phone number has country code (India: 91)
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const formattedNumber = cleanNumber.startsWith("91")
      ? cleanNumber
      : `91${cleanNumber}`;

    // MSG91 API URL for sending OTP
    const url = "https://control.msg91.com/api/sendotp.php";

    const params = new URLSearchParams({
      authkey: authKey,
      mobiles: formattedNumber,
      message: `Your ${restaurantName} verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
      sender: senderId,
      route: "4", // OTP route
      template_id: templateId
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (!response.ok) {
      console.error(`MSG91 API error: ${response.status}`);
      return {
        success: false,
        error: `HTTP ${response.status}`
      };
    }

    const data = await response.text();

    // MSG91 returns XML, parse basic success
    if (data.includes("success") || data.includes("1")) {
      return {
        success: true,
        requestId: formattedNumber
      };
    }

    return {
      success: false,
      error: data
    };
  } catch (error) {
    console.error("MSG91 send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Fallback OTP delivery for development/testing
 * Returns OTP in response (NOT FOR PRODUCTION)
 */
export function getTestOTP(): string {
  return "123456";
}

/**
 * Send OTP with fallback to test mode
 */
export async function sendOTP(
  phoneNumber: string,
  otp: string,
  restaurantName: string
): Promise<{ success: boolean; otp?: string; error?: string }> {
  // If MSG91 is not configured, use test mode
  if (!process.env.MSG91_AUTH_KEY) {
    console.warn("MSG91 not configured - returning OTP in test mode");
    return {
      success: true,
      otp: otp // ONLY for testing - don't return OTP in production
    };
  }

  const result = await sendOTPViaMSG91(phoneNumber, otp, restaurantName);
  return result;
}
