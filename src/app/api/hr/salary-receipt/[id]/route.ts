import { NextRequest } from 'next/server'
import { streamSalaryPdf } from '@/lib/pdf/generateSalaryPdf'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const { stream, fileName } = await streamSalaryPdf(id)

        // Convert NodeJS ReadableStream to Web ReadableStream
        const webStream = new ReadableStream({
            start(controller) {
                stream.on('data', (chunk) => controller.enqueue(chunk))
                stream.on('end', () => controller.close())
                stream.on('error', (err) => controller.error(err))
            }
        })

        return new Response(webStream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${fileName}"`
            }
        })

    } catch (err: any) {
        console.error('[PDF Route Error]', err)
        if (err.message === 'Salary sheet not found') {
            return new Response(err.message, { status: 404 })
        }
        return new Response('Internal Server Error', { status: 500 })
    }
}
