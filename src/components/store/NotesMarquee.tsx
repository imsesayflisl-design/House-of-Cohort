import { Marquee } from "@/components/motion/Marquee";

const NOTES = [
  "Oud",
  "Amber",
  "Vetiver",
  "Jasmine",
  "Sandalwood",
  "Musk",
  "Bergamot",
  "Cardamom",
  "Iris",
  "Tobacco",
  "Cedar",
  "Saffron",
];

export function NotesMarquee() {
  return (
    <section className="relative border-y border-ink/10 bg-parchment-deep py-9 lg:py-12">
      <Marquee durationSec={55}>
        {NOTES.map((note, i) => (
          <span
            key={`${note}-${i}`}
            className="mx-10 flex shrink-0 items-center gap-10 lg:mx-14"
          >
            <span className="font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-light italic leading-none text-ink">
              {note}
            </span>
            <span className="inline-block size-[10px] rotate-45 bg-brand-gold" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}
