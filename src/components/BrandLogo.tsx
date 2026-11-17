import { ResilientImage } from './ResilientImage';

interface BrandLogoProps {
  compact?: boolean;
}

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <span className="w-9 h-9 rounded-md overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0 flex items-center justify-center">
        <ResilientImage
          src="/src/assets/images/jhonty_hub_logo_1794941647740.jpg"
          alt="Jhonty Hub JH Monogram"
          className="w-full h-full object-cover object-[50%_26%] scale-125"
        />
      </span>
      <span className="flex flex-col leading-none text-left">
        <span
          className={`font-bold tracking-tight uppercase text-neutral-950 ${
            compact ? 'text-base' : 'text-lg sm:text-xl'
          }`}
        >
          Jhonty Hub
        </span>
      </span>
    </span>
  );
}
