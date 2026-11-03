# MiniMe Studio — prototipo 3D immersivo

Prototipo frontend per **MiniMe Studio**: statuette 3D cartoon personalizzate da una foto (~15 cm) con kit di pittura, prezzo indicativo 29,90 €.
Nessun backend, pagamento, login o upload reale.

## Avvio

```bash
npm install
npm run dev        # http://localhost:3000
npm run build     # export statico in out/
npm run preview   # serve out/ in locale
```

## Pubblicazione su GitHub Pages

Il workflow `.github/workflows/pages.yml` compila l'export statico a ogni push su `main` e lo pubblica.
Sul repository: **Settings → Pages → Source: GitHub Actions**. Il sito sarà su `https://<utente>.github.io/<nome-repo>/`.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Three.js · React Three Fiber · drei · GSAP + ScrollTrigger · Lenis · Motion · Lucide.

## Pagine

| Rotta | Contenuto |
| --- | --- |
| `/` | Hero 3D (caduta, squash & stretch, segue il mouse, drag, hover) → foto che si dissolve in particelle e diventa statuetta → 3 passi nello stesso spazio 3D (foto, stampa 3D layer-by-layer con clipping plane, pittura) → unboxing del kit guidato dallo scroll → galleria orizzontale simulata → CTA finale |
| `/kit` | Viewer 360° (orbit + zoom moderato), finitura bianca/colorata, componenti del kit, hotspot dettagli, unboxing a scroll |
| `/crea` | Configuratore 3D: capelli, colore capelli, vestiti, colori, carnagione, accessori, posa. Upload foto solo locale (object URL, nessun invio) |
| `/come-funziona` | Storytelling a scroll: una statuetta guida cambia posizione, materiale (wireframe → stampa → resina → dipinta) e interagisce con gli oggetti |
| `/faq` | Accordion animato + piccola statuetta decorativa |

## Architettura 3D

- `components/three/figurine/` — personaggi procedurali (nessun GLB): testa chibi, capelli (ricci istanziati, lunghi, corti, chignon), outfit, accessori, pose con bracci smorzati. `types.ts` contiene i preset.
- `components/three/resources.ts` — cache limitate di geometrie e materiali condivisi (resina opaca).
- `components/three/Stage.tsx` — wrapper leggero: rileva WebGL, monta il canvas solo vicino al viewport, lo smonta quando è lontano (libera il contesto GL), mette in pausa il render loop fuori schermo. Il runtime three/R3F (`StageCanvas.tsx`) è in un chunk caricato dinamicamente.
- Illuminazione da studio procedurale (Lightformer), nessun HDR esterno; ombre con `ContactShadows`.
- Lo scroll è letto da ScrollTrigger in un ref (`useScrollProgress`) e smorzato nei `useFrame`, senza re-render React. Le overlay testuali usano timeline GSAP scrubbed (`useScrubTimeline`).

## Accessibilità e performance

- `prefers-reduced-motion`: niente smooth scroll, niente intro animata, transizioni minime.
- DPR limitato su mobile e adattivo (`PerformanceMonitor`); dettaglio ridotto dei capelli su schermi piccoli.
- Senza WebGL il sito resta completo, con immagini statiche al posto delle scene.
- `canvas { touch-action: pan-y }` per non bloccare lo scroll verticale su mobile.

## Note

- La foto di esempio nella sequenza di trasformazione è un'illustrazione generata via canvas; la statuetta è una dimostrazione visiva, non una generazione AI.
- `public/images/minime-couple.webp` è l'immagine di riferimento fornita, usata come fallback statico.
