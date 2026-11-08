import { evidence } from '../content/evidence';
import { site } from '../content/site';
import { Accent, Body, Evidence, Heading, LinkArrow, Row, Stack } from '../components/ui';

export function Robots() {
  return (
    <>
      <Stack>
        <Heading>
          Then I wanted things to <Accent>move</Accent>
        </Heading>
        <Row>
          <Evidence {...evidence.disasterX} />
          <LinkArrow href={site.links.disasterXPaper}>Read the paper</LinkArrow>
        </Row>
      </Stack>
      <Stack>
        <Body>
          At AIUB I started building robots: a soccer bot for the intra-university competition, and an entry at the Technoxian World Robotics Championship in 2024.
        </Body>
        <Body>
          In 2025 I built DisasterX, an ESP32-CAM rover that streams video and sensor readings from places too dangerous to send people. It became my first paper as first author, published alongside a seismic sensor network we designed for earthquake prediction.
        </Body>
      </Stack>
    </>
  );
}
