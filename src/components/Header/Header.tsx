import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from "@radix-ui/react-alert-dialog"
import { NavigationMenu, NavigationMenuList } from "@radix-ui/react-navigation-menu"
import { Progress } from "@radix-ui/react-progress"
import { UploadCloudIcon, X, Loader2Icon, Laugh } from "lucide-react"
import Dropzone from "react-dropzone"
import { AlertDialogHeader } from "../ui/alert-dialog"
import { Button } from "../ui/button"
import { useUpload } from "@/hooks/upload"
import { useState } from "react"

const Header = (props) => {
    const [open, setOpen] = useState(false)
    const { uploading, progress, fileCount, successCount, errorCount, upload } = useUpload()

    return (
        <div className="w-full flex flex-row items-center justify-between p-5">
            <div className="text-lg font-bold">{props.title}</div>
            <NavigationMenu>
                <NavigationMenuList>
                </NavigationMenuList>
            </NavigationMenu>
            <AlertDialog open={open}>
                <AlertDialogTrigger>
                    <Button onClick={() => {
                        setOpen(true)
                    }}>
                        <UploadCloudIcon className="mr-2 h-4 w-4" /> 上传字体
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader className="gap-3">
                        <AlertDialogTitle className="flex flex-row justify-between items-center">上传字体
                            <Button variant='ghost' onClick={() => {
                                setOpen(false)
                            }}>
                                <X />
                            </Button>
                        </AlertDialogTitle>
                        <AlertDialogDescription className={`h-40 flex flex-col justify-center items-center border-dashed transition-all border-gra border-2 rounded-md`}>
                            <Dropzone
                                multiple={true}
                                accept={{
                                    'font/ttf': ['.ttf'],
                                    'font/otf': ['.otf'],
                                    'font/woff': ['.woff'],
                                    'font/woff2': ['.woff2'],
                                }}
                                onDrop={
                                    async (acceptedFiles: File[]) => {
                                        upload(acceptedFiles)
                                    }}
                            >
                                {
                                    ({ getRootProps, getInputProps }) => (
                                        <div {...getRootProps()} className="h-full w-full flex justify-center items-center gap-3">
                                            <input {...getInputProps()} />
                                            <div className="flex flex-col justify-center items-center gap-3">
                                                {
                                                    uploading ? (
                                                        <div className="flex flex-col justify-center items-center gap-3">
                                                            <Loader2Icon className="animate-spin h-10 w-10" />
                                                            <Progress className=" w-36" value={(progress / fileCount) * 100} />
                                                            <div>正在上传字体: {progress}/{fileCount}</div>
                                                        </div>
                                                    ) :
                                                        (successCount > 0 || errorCount > 0) ? (
                                                            <div className="flex flex-col justify-center items-center gap-3">
                                                                <div className="flex flex-row justify-center items-center gap-3">
                                                                    <Laugh className="h-10 w-10" />
                                                                    <div>上传完成 成功：{successCount} 失败：{errorCount}</div>
                                                                </div>
                                                            </div>
                                                        ) :
                                                            (
                                                                <div className="flex flex-col justify-center items-center gap-3">
                                                                    <UploadCloudIcon className="h-10 w-10" />
                                                                    <div>拖拽或点击上传字体</div>
                                                                </div>
                                                            )
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            </Dropzone>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
export default Header;