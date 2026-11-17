interface BrandLogoProps {
  compact?: boolean;
  variant?: 'light' | 'dark';
}

export function BrandLogo({ compact = false, variant = 'light' }: BrandLogoProps) {
  const logoSrc =
    variant === 'dark'
      ? '/assets/aistudio/jh-dark_8b71aaf0.svg'
      : '/assets/aistudio/jh-light_975fd8bc.svg';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <span
        className={`${
          compact ? 'w-8 h-8' : 'w-10 h-10'
        } rounded-md overflow-hidden shrink-0 flex items-center justify-center ${
          variant === 'dark' ? 'bg-[#080808]' : 'bg-white'
        }`}
      >
        <img
          src={logoSrc}
          alt="Jhonty Hub JH Monogram"
          className="w-full h-full object-contain"
        />
      </span>
      <span className="flex flex-col leading-none text-left">
        <span
          className={`font-bold tracking-tight uppercase ${
            variant === 'dark' ? 'text-white' : 'text-neutral-950'
          } ${compact ? 'text-base' : 'text-lg sm:text-xl'}`}
        >
          Jhonty Hub
        </span>
      </span>
    </span>
  );
}
