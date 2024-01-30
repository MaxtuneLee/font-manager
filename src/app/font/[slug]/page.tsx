"use client";
import { Check, ClipboardCopy, Loader2Icon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { useEffect, useMemo, useRef, useState } from 'react';
import opentype from 'opentype.js';
import { Font } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const Page = ({ params }: { params: { slug: string } }) => {
  const fontFamilyId = params.slug
  const { data, error, isLoading } = useSWR(`/api/font/family/${fontFamilyId}`, (url) => fetch(url).then((res) => res.json()))
  return (
    <div>
      {
        isLoading ? <div className="flex flex-row justify-center items-center gap-5"><Loader2Icon className="animate-spin"></Loader2Icon> loading...</div> :
          (
            <div>
              <div className="text-2xl font-bold">{data.data.name}</div>
              <div className='mt-5'>
                <FontInspector data={data} />
              </div>
              <div className="mt-10">
                <div className="text-lg font-bold">变体列表</div>
                <div className="mt-5 grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-10 *:cursor-pointer">
                  {data.data.fonts.map((item: any) => {
                    return (
                      <FontItems item={item} key={item.id} />
                    )
                  }
                  )}
                </div>
              </div>
            </div>
          )
      }
    </div>
  );
}

function FontInspector(data) {
  const [font, setFont] = useState(data.data.data.fonts[0])
  const [text, setText] = useState('My Conquest Is the Sea of Stars.')
  const [size, setSize] = useState(33)
  const [canvasPixelRatio, setCanvasPixelRatio] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fontRef = useRef<any>()

  useMemo(async () => {
    const localFont = await opentype.load(font.path, function (err, font) {
      if (err) {
        console.log(err)
      } else {
        fontRef.current = font
        const canvas = canvasRef.current as HTMLCanvasElement
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.clearRect(0, 0, 4000, 1500)
            ctx.setTransform(canvasPixelRatio, 0, 0, canvasPixelRatio, 0, 0)
            fontRef.current?.draw(ctx, text, 10, size + 5, size)
          }
        }
      }
    })
    return localFont
  }, [font])

  function enableHighDPICanvas(canvas: HTMLCanvasElement | string) {
    if (typeof canvas === 'string') {
      canvas = document.getElementById(canvas) as HTMLCanvasElement
    } else {
      if (canvas) {
        let pixelRatio = window.devicePixelRatio + 0.2 || 1;
        if (pixelRatio === 1) return;
        let oldWidth = canvas.getBoundingClientRect().width;
        let oldHeight = canvas.getBoundingClientRect().height;
        canvas.width = oldWidth * pixelRatio;
        canvas.height = oldHeight * pixelRatio;
        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';
        canvas.getContext('2d')?.scale(pixelRatio, pixelRatio);
        setCanvasPixelRatio(pixelRatio)
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, 4000, 1500)
        ctx.setTransform(canvasPixelRatio, 0, 0, canvasPixelRatio, 0, 0)
        fontRef.current?.draw(ctx, text, 10, size + 5, size)
      }
    }
  }, [font, text, size])

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement
    if (canvas) {
      enableHighDPICanvas(canvas)
    }
  }, [])

  return (
    <div className={` bg-slate-50 rounded-lg p-5 flex flex-col gap-5`}>
      <div className='text-lg font-bold'>字体调试器</div>
      <div className=' flex gap-4'>
        <Input defaultValue="My Conquest Is the Sea of Stars."
          onChange={(e) => { setText(e.target.value) }}
          className=' w-[300px]' />
        <Select onValueChange={
          (value) => {
            setFont(data.data.data.fonts.find((item: any) => {
              return item.fontSubFamily === value
            }))
          }
        }>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="选择变体" />
          </SelectTrigger>
          <SelectContent>
            {
              data.data.data.fonts.map((item: any) => {
                return (
                  <SelectItem key={item.id} value={item.fontSubFamily}>
                    {item.fontSubFamily === 'VF' ? '可变字体' : item.fontSubFamily}
                  </SelectItem>
                )
              })
            }
          </SelectContent>
        </Select>
        <Slider className='w-60' onValueChange={
          (e) => {
            setSize(e[0])
          }
        } defaultValue={[33]} max={200} min={10} step={1} />
      </div>
      <div className=' overflow-hidden' style={{ height: `${size + size / 1.8 + 10}px` }}>
        <canvas ref={canvasRef} className='w-full' id="canvas" width="400" height='150'></canvas>
      </div>
    </div>
  )
}

function FontItems({ item }: { item: Font }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rendered, setRendered] = useState(false)
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      opentype.load(`${item.path}`, (err, font) => {
        if (err) {
          console.log(err)
        } else {
          if (ctx) {
            ctx.clearRect(0, 0, 200, 200)
            font?.draw(ctx, 'Aa', 10, 100, 100)
            setRendered(true)
          }
        }
      })
    }
  }, [])

  return (
    <div key={item.id}>
      <div className="text-lg font-bold inline-flex items-center gap-2">{item.fontSubFamily}{rendered && <Check className='h-5 w-5' color='green' />}</div>
      <div className="text-base">{dayjs(item.uploadedAt).format('YYYY-MM-DD H:mm:ss')}</div>
      <div className="w-[200px] h-[120px] flex justify-center items-center relative">
        {
          rendered ? <></> : <Loader2Icon className=" absolute top-[60px] left-[120px] h-5 w-5 animate-spin" />
        }
        <canvas ref={canvasRef} className="mt-5" width="200" height="120" style={rendered ? {} : { visibility: 'hidden' }} ></canvas>
      </div>
    </div>
  );
}


export default Page;