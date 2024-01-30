import STATUS from "@/constant/statusCode";
import { db } from "@/lib/db";
import { handleResponse, resError } from "@/lib/response";
import { getRealPath } from "@/lib/utils";
import { promises as fs } from 'fs';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
    try {
        const fontData = await db.font.findUnique({
            where: {
                id: params.slug
            },
            include: {
                FontFamily: true
            }

        })
        if (fontData) {
            return handleResponse({ ...fontData, path: __dirname.split('\\.next\\server\\app\\api\\font')[0].replaceAll('\\', '/') + fontData.path });
        } else {
            return resError("Font not found", "Font not found", STATUS.NOT_FOUND);
        }
    } catch (error) {
        return resError(error);
    }
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
    try {
        const fontData = await db.font.findUnique({
            where: {
                id: params.slug
            }
        })
        if (fontData) {
            //check if font family has no font after delete
            const fonts = await db.font.findMany({
                where: {
                    fontFamilyId: fontData.fontFamilyId
                }
            })
            if (fonts.length === 1) {
                await db.fontFamily.delete({
                    where: {
                        id: fontData.fontFamilyId as string
                    }
                })
                await db.font.delete({
                    where: {
                        id: params.slug
                    }
                })
                await fs.unlink(getRealPath(fontData.path));
                return handleResponse('deleted');
            }
        } else {
            return resError("Font not found", "Font not found", STATUS.NOT_FOUND);
        }
    } catch (error) {
        return resError(error);
    }
}