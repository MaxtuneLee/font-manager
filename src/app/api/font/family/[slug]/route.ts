import { db } from "@/lib/db";
import { handleResponse, resError } from "@/lib/response";

// get font family info
export async function GET(req: Request, { params }: { params: { slug: string } }) {
    console.log('params: ', params);
    try {
        const fontFamily = await db.fontFamily.findUnique({
            where: {
                id: params.slug
            },
            include: {
                fonts: {
                    select: {
                        id: true,
                        name: true,
                        path: true,
                        size: true,
                        type: true,
                        fontSubFamily: true,
                        uploadedAt: true,
                    }
                }
            }
        });
        return handleResponse(fontFamily);
    } catch (error) {
        return resError(error);
    }
}