import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { MUSIC, type SceneKind } from "./script";
import { timeline, TOTAL_FRAMES, type TimedScene } from "./timing";
import { Brand, Open } from "./scenes/Opening";
import { MapScene, Services } from "./scenes/Work";
import { Field, Fleet, Hero, Spotlight } from "./scenes/Fleet";
import { Clients, Companies, End } from "./scenes/Proof";
import { C, Finish, Fonts } from "./ui";

const SCENE: Record<SceneKind, React.FC<{ d: number; at: number; scene: TimedScene }>> = {
  open: Open,
  brand: Brand,
  services: Services,
  map: MapScene,
  interlude: Spotlight,
  fleet: Fleet,
  hero: Hero,
  field: Field,
  companies: Companies,
  clients: Clients,
  end: End,
};

// Only the brand reveal and the closing sea dissolve (briefly); everything
// else - including into and out of KOUNDINYA - is a clean cut on the beat.
// Outgoing titles clear before a cut (see Hero/Field), so text never overlaps.
const DISSOLVE: Partial<Record<SceneKind, number>> = { brand: 22, end: 12 };

const Dissolve: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: interpolate(f, [0, dur], [0, 1], { extrapolateRight: "clamp" }) }}>{children}</AbsoluteFill>;
};

function musicVolume(scenes: TimedScene[]) {
  const ramp = 10;
  return (f: number) => {
    let v = MUSIC.volume;
    for (const s of scenes) {
      if (!s.voice) continue;
      const a = s.voice.from - ramp, b = s.voice.from + s.voice.durationInFrames + ramp;
      if (f > a - ramp && f < b + ramp) {
        const k = interpolate(f, [a - ramp, a, b, b + ramp], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        v = Math.min(v, MUSIC.volume - (MUSIC.volume - MUSIC.duckedVolume) * k);
      }
    }
    const fadeOut = interpolate(f, [TOTAL_FRAMES - 45, TOTAL_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return v * fadeOut;
  };
}

export const Film: React.FC = () => {
  const scenes = timeline();
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <Fonts />
      {scenes.map((s) => {
        const Comp = SCENE[s.kind];
        const dis = DISSOLVE[s.kind] ?? 0;
        const from = Math.max(0, s.from - dis);
        return (
          <Sequence key={s.id} from={from} durationInFrames={s.durationInFrames + (s.from - from)} name={s.id}>
            <Dissolve dur={dis || 1}>
              <Comp d={s.durationInFrames + (s.from - from)} at={from} scene={s} />
            </Dissolve>
          </Sequence>
        );
      })}
      <Finish />
      <Audio src={staticFile(MUSIC.file)} volume={musicVolume(scenes)} />
      {scenes.map((s) =>
        s.voice ? (
          <Sequence key={`vo-${s.id}`} from={s.voice.from} durationInFrames={s.voice.durationInFrames + 6} name={`vo ${s.id}`}>
            <Audio
              src={staticFile(s.voice.file)}
              volume={(f) => interpolate(f, [0, 2, s.voice!.durationInFrames - 3, s.voice!.durationInFrames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            />
          </Sequence>
        ) : null
      )}
    </AbsoluteFill>
  );
};
