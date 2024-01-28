import STATUS from "@/constant/statusCode";
import { NextResponse } from "next/server";

export const handleResponse = async (req?: unknown) => {
    const res = NextResponse.json({
        code: 200,
        message: "OK",
        data: req
    })
    return res;
}

export const resError = (error: unknown, message?: string, code?: number)=>{
    console.error(error);
    return NextResponse.json({
        code: code||STATUS.INTERNAL_SERVER_ERROR,
        message: message||"Internal Server Error"
    }, {
        status: code||STATUS.INTERNAL_SERVER_ERROR
    });
}