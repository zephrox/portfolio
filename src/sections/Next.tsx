import { site } from '../content/site';
import { Accent, Body, ButtonLink, Heading, Row } from '../components/ui';

export function Next() {
  return (
    <>
      <Heading>
        What comes <Accent>next</Accent>
      </Heading>
      <Body>
        I want to go deeper. I'm looking for a funded master's in machine learning, where I can keep working on affective computing and Bangla document recognition, and for AI engineering work where models leave the notebook and meet real users.
      </Body>
      <Row center>
        <ButtonLink href={site.links.work}>Hiring? See shipped work</ButtonLink>
        <ButtonLink href={site.links.research} variant="secondary">
          Supervising? See research
        </ButtonLink>
      </Row>
      <Body>
        Or just say hi at <a href={`mailto:${site.email}`}>{site.email}</a>.
      </Body>
    </>
  );
}
