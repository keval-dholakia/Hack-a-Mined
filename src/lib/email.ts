import nodemailer from 'nodemailer'

// Google API / SMTP Mailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Uses Google API/SMTP underlying bindings
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Needs Google App Password from myaccount.google.com/apppasswords
    },
})

export async function sendPayslipEmail(
    email: string,
    buffer: Buffer,
    fileName: string,
    employeeName: string,
    month: string,
    year: number
) {
    if (!email) return { error: 'Employee does not have an email address' }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('[EMAIL SERVICE] Missing SMTP_USER or SMTP_PASS. Automatically skipping email dispatch. Add these keys to .env.local via Google App Passwords.')
        return { success: true, skipped: true }
    }

    const mailOptions = {
        from: `"TechMicra HR" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Salary Slip - ${month} ${year}`,
        html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #6366f1;">Salary Slip Generated</h2>
        <p>Dear <strong>${employeeName}</strong>,</p>
        <p>We are pleased to inform you that your salary for the month of <strong>${month} ${year}</strong> has been successfully processed and paid.</p>
        <p>Please find attached your official Salary Slip PDF for your records.</p>
        <br/>
        <p style="font-size: 0.9em; color: #666;">
          If you have any discrepancies or concerns, please reach out directly to the HR Department.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.8em; color: #aaa text-align: center;">
          This is an automated message dispatched from TechMicra ERP.<br/>
          Do not reply directly to this email.
        </p>
      </div>
    `,
        attachments: [
            {
                filename: fileName,
                content: buffer,
                contentType: 'application/pdf'
            }
        ]
    }

    try {
        const info = await transporter.sendMail(mailOptions)
        console.log(`[EMAIL COMPLETED] Message sent: ${info.messageId}`)
        return { success: true }
    } catch (error: any) {
        console.error('[EMAIL FAILED]', error)
        return { error: 'Failed to dispatch email' }
    }
}
