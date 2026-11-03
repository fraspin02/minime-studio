import Link from "next/link";
import { Logo } from "./Header";

export function Footer() {
  return (
    <footer className="bg-cream px-4 pb-8 pt-20 md:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 border-t border-ink/10 pt-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <Logo />
            <p className="max-w-xs text-[15px] leading-relaxed text-ink-soft">
              Statuette 3D cartoon da una foto, alte circa 15 cm, con kit di pittura incluso. Progettate per essere regalate, e colorate insieme.
            </p>
          </div>
          <FooterCol title="Esplora" links={[["/kit", "Il Kit"], ["/come-funziona", "Come funziona"], ["/crea", "Crea la tua MiniMe"], ["/faq", "FAQ"]]} />
          <FooterCol title="Idee regalo" links={[["/crea", "Coppie"], ["/crea", "Lauree"], ["/crea", "Amici"], ["/crea", "Con il tuo animale"]]} />
          <div className="space-y-4">
            <p className="text-eyebrow text-ink/50">Prototipo</p>
            <p className="text-[14px] leading-relaxed text-ink-soft">
              Questo sito è un prototipo dimostrativo: nessun ordine, pagamento o caricamento reale.
            </p>
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-3 text-[13px] text-ink/50 md:flex-row">
          <p>© {new Date().getFullYear()} MiniMe Studio. Fatto con cura, a mano e in 3D.</p>
          <p>Prezzo indicativo kit: 29,90 €</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="space-y-4">
      <p className="text-eyebrow text-ink/50">{title}</p>
      <ul className="space-y-2.5">
        {links.map(([href, label]) => (
          <li key={label}>
            <Link href={href} className="text-[15px] font-medium transition-colors hover:text-violet-deep">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
