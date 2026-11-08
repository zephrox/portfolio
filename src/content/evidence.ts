/**
 * Evidence for each chapter. These are TEMPORARY placeholders: freely licensed photos from
 * Wikimedia Commons that match each section's subject, each shown with a visible "Placeholder"
 * note and credit so no visitor mistakes them for Anjir's own work. Full licences: CREDITS.md.
 *
 * To use a real photo: drop it in public/evidence/ (WebP, max 200 KB), point `src` at it, write a
 * true `alt`, and remove `placeholder` and `credit`.
 */
export interface EvidenceItem {
  /** Shown in the dashed box if there is no image; also the fallback alt text. */
  label: string;
  src?: string;
  alt?: string;
  video?: boolean;
  /** True while the image is a stand-in, not Anjir's own photo. */
  placeholder?: boolean;
  /** Short attribution shown under a placeholder. */
  credit?: string;
}

export const evidence = {
  scienceFair: {
    label: 'Photo: the science fair',
    src: '/evidence/science-fair.webp',
    alt: 'Placeholder photo: a student presents a robotics project at a science fair poster board.',
    placeholder: true,
    credit: 'US NRC, public domain',
  },
  disasterX: {
    label: 'Photo: DisasterX rover',
    src: '/evidence/rescue-rover.webp',
    alt: 'Placeholder photo: a small wheeled rescue rover with a camera mast in a disaster test arena.',
    placeholder: true,
    credit: 'Mike1024, public domain',
  },
  cogniLink: {
    label: 'Clip: CogniLink reacting',
    src: '/evidence/kismet.webp',
    alt: 'Placeholder photo: Kismet, an MIT robot head with expressive eyes, brows and ears.',
    placeholder: true,
    credit: 'Rama, CC BY-SA 3.0',
  },
  shohojLipi: {
    label: 'Screenshot: Shohoj Lipi',
    src: '/evidence/bangla-handwriting.webp',
    alt: "Placeholder image: Rabindranath Tagore's handwritten Bengali verse with English lines.",
    placeholder: true,
    credit: 'Tagore, public domain',
  },
  greensoft: {
    label: 'Screenshot: Greensoft site',
    src: '/evidence/website-laptop.webp',
    alt: 'Placeholder photo: a laptop showing a website.',
    placeholder: true,
    credit: 'Jens Kreuter, CC0',
  },
} satisfies Record<string, EvidenceItem>;
