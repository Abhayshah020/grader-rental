import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type MachineCardProps = {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  description: string;
};

export default function MachineCard({ title, subtitle, image, href, description }: MachineCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-[#e4e9ed] bg-white">
      <Link href={href} aria-label={`View ${title} rental details`} className="block overflow-hidden bg-[#edf1f3]">
        <div className="aspect-[16/10] overflow-hidden sm:aspect-[5/3]">
          <img src={image} alt={title} loading="lazy" decoding="async" className="machine-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <p className="eyebrow text-[10px] sm:text-xs">{subtitle}</p>
        <h3 className="mt-2 text-xl font-extrabold leading-tight text-[#182b3a] sm:text-2xl">{title}</h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-[#637381]">{description}</p>
        <Link href={href} className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-extrabold text-[#93650f]">
          Explore rental details <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
