import { clsx } from "clsx";
export function cn(...values: Array<string|false|null|undefined>) { return clsx(values); }
export function Badge({children,className=""}:{children:React.ReactNode;className?:string}) { return <span className={cn("inline-flex items-center rounded-full border border-line bg-white/[.035] px-2 py-0.5 text-[10px] font-medium text-muted",className)}>{children}</span>; }