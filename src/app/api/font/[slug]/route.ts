import STATUS from "@/constant/statusCode";
import { db } from "@/lib/db";
import { handleResponse, resError } from "@/lib/response";
import { promises as fs } from 'fs';
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
    let returnData
    try {
        await db.font.findUnique({
            where: {
                id: params.slug
            },
            include: {
                FontFamily: true
            }

        }).then((fontData: any) => {
            if (fontData) {
                returnData = handleResponse({ ...fontData, path: __dirname.split('\\.next\\server\\app\\api\\font')[0].replaceAll('\\', '/') + fontData.path });
            } else {
                returnData = resError("Font not found", "Font not found", STATUS.NOT_FOUND);
            }
        }).catch(() => {
            returnData = resError("Font not found", "Font not found", STATUS.NOT_FOUND);
        });
    } catch (error) {
        returnData = resError(error);
    }
    return returnData;
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
    let returnData
    try {
        await db.font.findUnique({
            where: {
                id: params.slug
            }
        }).then(async (fontData) => {
            if (fontData) {
                //check if font family has no font after delete
                await db.font.findMany({
                    where: {
                        fontFamilyId: fontData.fontFamilyId
                    }
                }).then(async (fonts) => {
                    if (fonts.length === 1) {
                        await db.fontFamily.delete({
                            where: {
                                id: fontData.fontFamilyId as string
                            }
                        }).then(async () => {
                            await db.font.delete({
                                where: {
                                    id: params.slug
                                }
                            }).then(async () => {
                                await fs.unlink(__dirname.split('\\.next\\server\\app\\api\\font')[0].replaceAll('\\', '/') + fontData.path);
                                returnData = handleResponse('deleted');
            
                            }).catch((error) => {
                                returnData = resError(error);
                            });
                        }).catch((error) => {
                            returnData = resError(error);
                        });
                    }
                }).catch((error) => {
                    returnData = resError(error);
                });
            } else {
                returnData = resError("Font not found", "Font not found", STATUS.NOT_FOUND);
            }
        }).catch((error) => {
            returnData = resError(error);
        });
    } catch (error) {
        returnData = resError(error);
    }
    return returnData;
}