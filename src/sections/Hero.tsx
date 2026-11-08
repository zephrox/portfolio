import { Accent, Body, Heading } from '../components/ui';

export function Hero() {
  return (
    <>
      <Heading as="h1" size="display">
        Hi, I'm <Accent>Anjir</Accent>.
      </Heading>
      <Body size="lg">
        I'm a developer and machine learning researcher from Bangladesh. I build models that read faces and Bangla, then ship them as software people use.
      </Body>
      <Body size="sm">Grab a cup of tea. The story takes about two minutes.</Body>
    </>
  );
}
