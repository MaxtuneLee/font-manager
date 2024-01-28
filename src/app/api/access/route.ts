import { handleResponse } from "@/lib/response";

export function GET(req: Request, res: Response) {
    return handleResponse('hello')
}