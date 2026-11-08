import { site } from '../content/site';
import { Accent, Body, Evidence, Heading, LinkArrow, Row } from '../components/ui';

export function Shipping() {
  return (
    <>
      <Heading>
        Research only matters once it <Accent>ships</Accent>
      </Heading>
      <Body>
        Today I work as a full-stack developer. I built the website for Greensoft Solutions, an IT and cybersecurity firm that works with the Supreme Court of Bangladesh and the ICT Division, and Chakrify, which reads a CV and scores it against a job description.
      </Body>
      <Body>Shipping taught me what papers don't: load times, failure cases and the person on the other side of the screen.</Body>
      <Row>
        <Evidence label="Screenshot: Greensoft site" />
        <LinkArrow href={site.links.work}>See shipped work</LinkArrow>
      </Row>
    </>
  );
}
