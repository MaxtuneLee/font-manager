import STATUS from "@/constant/statusCode";
import { db } from "@/lib/db";
import { handleResponse, resError } from "@/lib/response";
import { getRealPath } from "@/lib/utils";
import { Font } from "@/types/type";
import { promises as fs } from "fs";
import opentype from "opentype.js";

// In general, I don't think that it's actually possible to obtain this information with any certainty, considering that there's a number of ways a font could be made to look bold/italic.
// For example, in non-embedded standard fonts, you can usually tell by the font name (as is done here).
// For embedded fonts, it's usually a lot more difficult, since the font name may be (and often is) somewhat arbitrary. In this case, whether or not the text looks bold/italic depends on the embedded font data itself.
// Then there are the font flags, but based on experience I wouldn't really trust them.
// 所以在这里只能通过字体名称来判断字体的变体，如果有fvar信息的话我会将它纳入考虑范围，但是最终的字体变体存储还是以 subFamily 为主。
// 由于需求是直观展示字体支持的变体，并且方便引用，所以更加具体的字体变体信息处理在前端部分，这里只是简单的判断字体变体。

/**
 * @api {post} /api/font/ 1. Create
 */
export async function POST(req: Request, res: Response) {
    let returnData: any
    try {
        const formData = await req.formData();
        const files = formData.getAll("file") as File[];
        if (!files.length) {
            returnData = resError('No file found, try "file" as propertie name');
        }
        // configure font one by one
        for (const file of files) {
            // 虽然已经写异步了，但是由于orm的原因，这里需要延迟一下
            // 否则处理多个文件的时候会出现数据还没存进去就处理下一个，导致创建了多个相同的 fontfamily
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(0);
                }, 100);
            });
            const fileBuffer = await file.arrayBuffer();
            const fileName = file.name;
            const fileExt = fileName.split(".").pop();
            // const fileId = URL.createObjectURL(file).split("nodedata")[1].slice(1);
            const filePath = `public/assets/fonts/${fileName}`;
            try {
                // check if file already exist
                await fs.access(`./${filePath}`);
                returnData = resError("File already exist", "File already exist", STATUS.ALREADY_EXIST);
            } catch (error) {
                try {
                    await fs.writeFile(`./${filePath}`, Buffer.from(fileBuffer));
                } catch (error) {
                    // crate folder if not exist
                    await fs.mkdir(`./public/assets/fonts/`, { recursive: true });
                    await fs.writeFile(`./${filePath}`, Buffer.from(fileBuffer));
                }
            }
            console.log(__dirname.split('.next')[0], filePath)
            const font = await opentype.load(getRealPath(filePath));
            if (!font) {
                fs.unlink(`.${filePath}`);
                returnData = resError('Font file error', 'Font file error', STATUS.BAD_REQUEST);
            }
            console.log(font.names)
            // get supported variable
            // console.log(loadedFont.tables.fvar)
            const fontFamily = (font.names as any).preferredFamily?.zh || (font.names as any).preferredFamily?.en || (font.names.fontFamily?.zh || font.names.fontFamily.en);
            const fontSubFamily = (font.tables.fvar ? 'VF' : null) || (font.names as any).preferredSubfamily?.zh || (font.names as any).preferredSubfamily?.en || (font.names.fontSubfamily?.zh || font.names.fontSubfamily.en);
            console.log(fontFamily)
            const fontData: Font = {
                // 如果存在fvar table的话说明是可变字体，用VF作为字体的名称，否则用字体的全称作为字体的名称
                name: (font.tables.fvar ? 'VF' : null) || font.names.fullName?.zh || font.names.fullName.en,
                path: filePath.split('public')[1],
                size: file.size,
                type: fileExt as string || '',
                fontSubFamily: fontSubFamily,
                copyright: font.names.copyright?.zh || font.names.copyright.en,
                license: font.names.license?.zh || font.names.license?.en || '',
                uploadedAt: new Date().toISOString(),
                variants: font.tables.fvar ? Object.keys(font.tables.fvar.instances).map(
                    (key) => {
                        return font.tables.fvar.instances[key].name.zh || font.tables.fvar.instances[key].name.en
                    }
                ) : [fontSubFamily],
                fvar: font.tables.fvar || {}
            }
            // create fontfamily first if not exist
            try {
                const fontFamilyData = await db.fontFamily.findFirst({
                    where: {
                        name: fontFamily
                    }
                })
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
                        // fs.unlink(`${filePath}`);
                        console.log('exist')
                        return resError("Font already exist", "Font already exist", STATUS.ALREADY_EXIST);
                    } else {
                        await db.font.create({
                            data: {
                                ...fontData,
                                fontFamilyId: fontFamilyData.id,
                            }
                        });
                        // update font family variants data with the font variant
                        const alreadyExistVariant = fontFamilyData.variants
                        const newVariant = [...new Set([...alreadyExistVariant, ...fontData.variants])]
                        await db.fontFamily.update({
                            where: {
                                id: fontFamilyData.id
                            },
                            data: {
                                variants: newVariant
                            }
                        })
                        return handleResponse();
                        // console.log('here', returnData)
                    }
                } else {
                    console.log('fontfamily data: ', fontFamily)
                    // create new font family
                    await db.fontFamily.create({
                        data: {
                            name: fontFamily,
                            fonts: {
                                create: fontData
                            },
                            variants: fontData.variants
                        }
                    });
                    return handleResponse();
                }
            } catch (error) {
                fs.unlink(`${filePath}`);
                return resError(error);
            }
        }
        // console.log(returnData)
    } catch (error) {
        return resError(error);
    }
}

/**
 * @api {get} /api/font/ 2. get font list
 */
export async function GET() {
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