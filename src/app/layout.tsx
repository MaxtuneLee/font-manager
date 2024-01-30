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
import Dropzone from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { useUpload } from "@/hooks/upload";
import Header from "@/components/Header/Header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh_CN">
      <body className={inter.className}>
        <Header title="Font Manager" />
        {children}
      </body>
    </html>
  );
}
