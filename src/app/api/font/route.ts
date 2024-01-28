import STATUS from "@/constant/statusCode";
import { db } from "@/lib/db";
import { handleResponse, resError } from "@/lib/response";
import { Font } from "@/types/type";
import { promises as fs } from "fs";
import opentype from "opentype.js";

/**
 * @api {post} /api/font/ 1. Create
 */
export async function POST(req: Request, res: Response) {
    let returnData: any = resError("Internal Server Error", "Internal Server Error", STATUS.INTERNAL_SERVER_ERROR);
    try {
        const formData = await req.formData();
        const files = formData.getAll("file") as File[];
        if (!files.length) {
            returnData = resError('No file found, try "file" as propertie name');
        }
        console.log(files);
        // save file to /assets/fonts
        const fontloop = async (file: File) => {
            return new Promise(async (resolve, reject) => {
                const fileBuffer = await file.arrayBuffer();
                const fileName = file.name;
                const fileExt = fileName.split(".").pop();
                const fileId = URL.createObjectURL(file).split("nodedata")[1].slice(1);
                const filePath = `public/assets/fonts/${fileId}.${fileExt}`;
                await fs.writeFile(`./${filePath}`, Buffer.from(fileBuffer));
                console.log(__dirname.split('.next')[0], filePath.slice(1))
                opentype.load(__dirname.split('.next')[0] + filePath, async function (err, font) {
                    const loadedFont = font as opentype.Font;
                    if (err) {
                        fs.unlink(`.${filePath}`);
                        returnData = resError(err);
                    }
                    console.log(loadedFont.names)
                    const fontFamily = (loadedFont.names as any).preferredFamily?.en || (loadedFont.names.fontFamily?.en || loadedFont.names.fontFamily.zh);
                    console.log(fontFamily)
                    const fontData: Font = {
                        name: loadedFont.names.fullName?.en || loadedFont.names.fullName.zh,
                        path: filePath.split('public')[1],
                        size: file.size,
                        type: file.type.split("/")[1],
                        fontSubFamily: (loadedFont.names as any).preferredSubfamily?.en || (loadedFont.names.fontSubfamily?.en || loadedFont.names.fontSubfamily.zh),
                        copyright: loadedFont.names.copyright?.en || loadedFont.names.copyright.zh,
                        license: loadedFont.names.license?.en || loadedFont.names.license?.zh || '',
                        uploadedAt: new Date().toISOString(),
                    }
                    // create fontfamily first if not exist
                    await db.fontFamily.findFirst({
                        where: {
                            name: fontFamily
                        }
                    }).then(async (fontFamilyData) => {
                        if (fontFamilyData) {
                            // add font to font family
                            // check if font already exist
                            const font = await db.font.findFirst({
                                where: {
                                    name: fontData.name
                                }
                            });
                            if (font) {
                                // delete file if font already exist
                                fs.unlink(`.${filePath}`);
                                console.log('exist')
                                returnData = resError("Font already exist", "Font already exist", STATUS.ALREADY_EXIST);
                            } else {
                                await db.font.create({
                                    data: {
                                        ...fontData,
                                        fontFamilyId: fontFamilyData.id,
                                    }
                                });
                                returnData = handleResponse();
                            }
                        } else {
                            console.log('fontfamily data: ', fontFamily)
                            // create new font family
                            await db.fontFamily.create({
                                data: {
                                    name: fontFamily,
                                    fonts: {
                                        create: fontData
                                    }
                                }
                            });
                            returnData = handleResponse();
                        }
                    }).catch((error) => {
                        // delete file if error
                        fs.unlink(`.${filePath}`);
                        returnData = resError(error);
                    });
                });
                setTimeout(() => {
                    resolve(0);
                }, 100);
            })
        }
        for (const file of files) {
            await fontloop(file);
        }
        return returnData
    } catch (error) {
        return resError(error);
    }
}

/**
 * @api {get} /api/font/ 2. get font list
 */
export async function GET(req: Request, res: Response) {
    try {
        const fontFamily = await db.fontFamily.findMany({
            orderBy: {
                createdAt: "desc"
            },
            include: {
                _count: {
                    select: {
                        fonts: true
                    }
                }
            }
        });
        return handleResponse(fontFamily);
    } catch (error) {
        return resError(error);
    }
}