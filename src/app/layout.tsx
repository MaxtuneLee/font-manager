"use client"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cross, CrossIcon, Laugh, Loader2Icon, Mail, ServerCrashIcon, UploadCloudIcon, X } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import Upload from 'rc-upload'
import { useState } from "react";
import { useSWRConfig } from "swr";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [fileList, setFileList] = useState<File[]>([])
  const { mutate } = useSWRConfig()
  return (
    <html lang="zh_CN">
      <body className={inter.className}>
        <div className="w-full flex flex-row items-center justify-between p-5">
          <div className="text-lg font-bold">Font info manager</div>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    FontFamily 列表
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/font" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Api 文档
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <AlertDialog open={open}>
            <AlertDialogTrigger>
              <Button onClick={() => { setOpen(true) }}>
                <UploadCloudIcon className="mr-2 h-4 w-4" /> 上传字体
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader className="gap-3">
                <AlertDialogTitle className="flex flex-row justify-between items-center">上传字体<Button variant='ghost' onClick={() => { setOpen(false) }}><X /></Button></AlertDialogTitle>
                <AlertDialogDescription className=" h-40 flex flex-col justify-center items-center border-dashed border-gray-400 border-2 rounded-md">
                  <Upload
                    // multiple={true}
                    accept='.ttf, .otf, .woff, .woff2'
                    action='/api/font'
                    className=" h-full w-full flex justify-center items-center gap-3"
                    beforeUpload={(file) => {
                      setFileList([...fileList, file])
                    }}
                    onStart={() => {
                      setUploading(true)
                    }}
                    onSuccess={() => {
                      setUploading(false)
                      setSuccess(true)
                      mutate('/api/font')
                      setTimeout(() => {
                        setOpen(false)
                        setSuccess(false)
                        setFileList([])
                      }
                        , 2000)
                    }}
                    onError={() => {
                      setUploading(false)
                      setError(true)
                      setTimeout(() => {
                        setOpen(false)
                        setError(false)
                        setFileList([])
                      }
                        , 2000)
                    }}
                  >
                    {
                      uploading ? <div className="flex flex-col justify-center items-center gap-3">
                        <Loader2Icon className="animate-spin"></Loader2Icon> 上传中...</div>
                        :
                        success ? <div className="flex flex-col justify-center items-center gap-3 text-green-600">
                          <Laugh className="h-10 w-10 text-green-600"></Laugh> 上传成功</div>
                          : error ? <div className="flex flex-col justify-center items-center gap-3 text-red-700">
                            <ServerCrashIcon className="h-10 w-10 text-red-700"></ServerCrashIcon> 上传失败</div>
                            : <div className="flex flex-col justify-center items-center gap-3 text-center">
                              <UploadCloudIcon className="h-10 w-10"></UploadCloudIcon> 拖拽到这里上传<br />
                              支持上传 ttf、otf、woff、woff2 格式的字体文件
                            </div>
                    }
                  </Upload>
                </AlertDialogDescription>
              </AlertDialogHeader>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {children}
      </body>
    </html>
  );
}
