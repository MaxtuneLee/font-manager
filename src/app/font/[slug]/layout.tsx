"use client"
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

const Layout = ({ children }:{children: ReactNode}) => {
    const route = useRouter()
    return (
        <div className="flex flex-col gap-5 p-10 box-content">
            <Button className="h-10 w-10 gap-3 justify-start" variant="ghost" size="icon" onClick={()=>{
                route.back()
            }}>
                <ChevronLeft className="h-4 w-4 flex-shrink-0" /> <div className="text-base">返回</div>
            </Button>
            {children}
        </div>
    )
}
export default Layout;