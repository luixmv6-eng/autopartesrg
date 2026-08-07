import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Logotipo tal como lo compone Stitch: glifo `build_circle` relleno más el
 * nombre en primary. Sustituir por el archivo oficial cuando exista.
 */
export function Logo({
  className,
  tamanoTexto = "text-headline-md",
  tamanoIcono = 26,
  mostrarIcono = true,
}: {
  className?: string;
  tamanoTexto?: string;
  tamanoIcono?: number;
  mostrarIcono?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-sm font-bold text-primary", className)}>
      {mostrarIcono && <Icon name="build_circle" size={tamanoIcono} filled />}
      <span className={tamanoTexto}>AutopartesRG</span>
    </span>
  );
}
