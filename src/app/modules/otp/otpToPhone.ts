import { Twilio } from 'twilio'
import config from '../../config'

const twilioClient = new Twilio(config.twilio_sid, config.twilio_auth_token)

async function sendOtpToPhone(phone: string, otp: string) {
  try {
    const message = await twilioClient.messages.create({
      body: `Jibonix account verification code is: ${otp}`,
      from: config.twilio_phone_number,
      to: phone
    })
    return message
  } catch (error) {
    console.error('Error sending OTP:', error)
    throw new Error('Failed to send OTP')
  }
}

export async function otpToPhone(phone: string, otp: string) {
  try {
    const message = await sendOtpToPhone(phone, otp)
    return {
      status: 'success',
      message: `OTP sent successfully to ${phone}`,
      sid: message.sid
    }
  } catch (error) {
    console.error('Error sending OTP:', error)
    throw new Error('Failed to send OTP')
  }
}
