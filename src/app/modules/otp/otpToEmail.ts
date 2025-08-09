import nodeMailer from 'nodemailer'
import config from '../../config'

export const otpToEmail = async ({
  email,
  subject,
  message
}: {
  email: string
  subject: string
  message: string
}) => {
  const transporter = nodeMailer.createTransport({
    ...(config.smtp_service
      ? {
          service: config.smtp_service,
          auth: {
            user: config.smtp_mail,
            pass: config.smtp_password
          }
        }
      : {
          host: config.smtp_host,
          port: config.smtp_port,
          secure: config.smtp_port,
          auth: {
            user: config.smtp_mail,
            pass: config.smtp_password
          }
        })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

  const options = {
    from: config.smtp_mail,
    to: email,
    subject,
    html: message
  }

  await transporter.sendMail(options)
}
