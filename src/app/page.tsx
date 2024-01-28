"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FontFamily } from "@/types/type";
import dayjs from "dayjs";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

export default function Home() {
  const { data, error, isLoading } = useSWR("/api/font", (url) => fetch(url).then((res) => res.json()));
  console.log(data, error, isLoading)
  return (
    <main className="p-10 w-full">
      {
        isLoading ? <div className="flex flex-row justify-center items-center gap-5"><Loader2Icon className="animate-spin"></Loader2Icon> loading...</div> :
          <div className=" grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-10 *:cursor-pointer">
            {data?.data.map((item: FontFamily) => {
              return (
                <Link href={`/font/${item.id}`} key={item.id}>
                  <Card className="hover:scale-105 hover:shadow-lg transition-all">
                    <CardHeader>
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>{dayjs(item.createdAt).format('YYYY-MM-DD H:mm:ss')}</CardDescription>
                    </CardHeader>
                    <CardContent>包含变体数：{(item as any)._count?.fonts ?? 0}</CardContent>
                  </Card>
                </Link>
              )
            }
            )}
          </div>
      }
    </main>
  );
}
