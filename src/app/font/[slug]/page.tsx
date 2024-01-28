"use client";
import { Check, ClipboardCopy, Loader2Icon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { useEffect, useRef, useState } from 'react';
import opentype from 'opentype.js';
import { Font } from '@prisma/client';
import { Button } from '@/components/ui/button';

const Page = ({ params }: { params: { slug: string } }) => {
    const fontFamilyId = params.slug
    const { data, error, isLoading } = useSWR(`/api/font/family/${fontFamilyId}`, (url) => fetch(url).then((res) => res.json()))
    // console.log(data)
    useEffect(() => {
        if (data) {
            (data.data.fonts as Font[]).forEach((item: Font, index: number) => {
                const canvas = document.querySelectorAll('canvas')[index]
                const ctx = canvas.getContext('2d')
                opentype.load(`${item.path}`, (err, font) => {
                    if (err) {
                        console.log(err)
                    } else {
                        if (ctx) {
                            ctx.clearRect(0, 0, 200, 200)
                            font?.draw(ctx, 'Aa', 10, 100, 100)
                        }
                    }
                })
            })
        }
    }, [data])
    return (
        <div>
            {
                isLoading ? <div className="flex flex-row justify-center items-center gap-5"><Loader2Icon className="animate-spin"></Loader2Icon> loading...</div> :
                    (
                        <div>
                            <div className="text-2xl font-bold">{data.data.name}</div>
                            <div className="text-lg font-bold">变体列表</div>
                            <div className="mt-10 grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-10 *:cursor-pointer">
                                {data.data.fonts.map((item: any) => {
                                    return (
                                        <FontItems item={item} key={item.id} />
                                    )

                                    function FontItems({ item }: { item: Font }) {
                                        const [copied, setCopied] = useState(false)
                                        return (
                                            <div key={item.id}>
                                                <div className="text-lg font-bold">{item.fontSubFamily}</div>
                                                <div className="text-base">{dayjs(item.uploadedAt).format('YYYY-MM-DD H:mm:ss')}</div>
                                                <canvas className="mt-5" width="200" height="120" style={{ fontFamily: data.data.name }}></canvas>
                                                {/* copy request path */}
                                                <Button className="mt-5 *:flex *:gap-2 *:items-center" variant='outline' onClick={() => {
                                                    const currentUrl = window.location.protocol+'://'+window.location.host;
                                                    const fontPath = currentUrl + item.path;
                                                    navigator.clipboard.writeText(fontPath);
                                                    setCopied(true);
                                                    setTimeout(() => {
                                                        setCopied(false);
                                                    }, 1000);
                                                }}>
                                                    {copied ? (<div><Check height={20} color="#15b74e" /> <span>已复制</span></div>) : (<div><ClipboardCopy height={20} /> <span>复制引用地址</span></div>)}
                                                </Button>
                                            </div>);
                                    }
                                }
                                )}
                            </div>
                        </div>
                    )
            }
        </div>
    );
}

export default Page;