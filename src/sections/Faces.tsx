import { site } from '../content/site';
import { Accent, Body, Evidence, Heading, LinkArrow, Row } from '../components/ui';

export function Faces() {
  return (
    <>
      <Heading>
        Robots kept misreading <Accent>faces</Accent>
      </Heading>
      <Body>
        A robot that responds to people has to read their faces, and raw classifiers flicker with every blink. For CogniLink, my desktop companion robot, I tracked 468 facial landmarks and wrote Sticky Focus, a filter that waits for 85% agreement before the robot changes its mood. Behavioral jitter dropped by 90%.
      </Body>
      <Body>
        That problem became my thesis: facial expression recognition that holds up when pose and lighting change, using anatomical disentanglement and contrastive learning. Along the way I co-authored work on reading emotion from EEG signals.
      </Body>
      <Row>
        <Evidence label="Clip: CogniLink reacting" />
        <LinkArrow href={site.links.cogniLink}>See CogniLink</LinkArrow>
      </Row>
    </>
  );
}
