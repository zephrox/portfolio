import { evidence } from '../content/evidence';
import { site } from '../content/site';
import { Accent, Body, Evidence, Heading, LinkArrow, Row } from '../components/ui';

export function Language() {
  return (
    <>
      <Heading>
        Then I turned to my own <Accent>language</Accent>
      </Heading>
      <Body>
        Dense Bangla text can shut out readers with dyslexia. Shohoj Lipi, built for the SciBlitz AI Challenge 2026 at IEEE CUET, scores how hard a passage is, flags difficult sentences with a fine-tuned BanglaBERT model (85.1% validation accuracy) and rewrites them with an LLM while keeping the facts intact.
      </Body>
      <Body>It reads aloud, marks syllable boundaries and shows exactly what changed, so the reader can always check the original.</Body>
      <Row>
        <Evidence {...evidence.shohojLipi} />
        <LinkArrow href={site.links.shohojLipi}>Try Shohoj Lipi</LinkArrow>
      </Row>
    </>
  );
}
