import Image from 'next/image';
import { webPortrait } from '@/data/team';

interface PortraitProps {
  /** Original image path from src/data/team.ts. */
  image: string;
  name: string;
  /** CSS object-position for the crop. */
  position: string;
  /** The rendered width, for the browser's source choice. */
  sizes: string;
  /** Frame size and aspect ratio. */
  className?: string;
  priority?: boolean;
}

/**
 * Duotone portrait: ink shadows over a pale ground, with the colour photo underneath.
 * The nearest `.group` ancestor reveals the colour on hover or keyboard focus.
 */
export default function Portrait({ image, name, position, sizes, className = '', priority = false }: PortraitProps) {
  const src = webPortrait(image);
  return (
    <div className={`duotone ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} priority={priority} className="duotone-mono object-cover" style={{ objectPosition: position }} />
      <Image src={src} alt={name} fill sizes={sizes} priority={priority} className="duotone-color object-cover" style={{ objectPosition: position }} />
    </div>
  );
}
