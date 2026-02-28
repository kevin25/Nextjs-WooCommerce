'use client'
import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductImage {
  id: number
  src: string
  name: string
  alt: string
}

interface Props {
  images: ProductImage[]
}

export default function ProductGallery({ images }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const mainImage = images[selectedIndex] ?? images[0]

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted">
        <span className="text-muted-foreground">No image available</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={mainImage.src}
          alt={mainImage.alt || mainImage.name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                index === selectedIndex
                  ? 'border-primary'
                  : 'border-transparent hover:border-muted-foreground/30'
              )}
            >
              <Image
                src={image.src}
                alt={image.alt || image.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
