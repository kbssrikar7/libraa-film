import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { MUSIC, type SceneKind } from "./script";
import { timeline, TOTAL_FRAMES, type TimedScene } from "./timing";
import { Brand, Open } from "./scenes/Opening";
import { MapScene, Services } from "./scenes/Work";
import { Field, Fleet, Hero } from "./scenes/Fleet";
import { Clients, Companies, End } from "./scenes/Proof";
import { C, Finish, Fonts } from "./ui";
import { Subtitles } from "./Subtitles";

const SCENE: Record<SceneKind, React.FC<{ d: number; at: number; scene: TimedScene }>> = {
  open: Open,
  brand: Brand,
  services: Services,
  map: MapScene,
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
// clients also dissolve in from the certificates (both dark), no empty
// frame between them
const DISSOLVE: Partial<Record<SceneKind, number>> = { brand: 22, clients: 18, end: 12 };

// dur 0 is a hard cut: the scene is fully visible from its first frame
// (a 1-frame fade used to leave that frame transparent - a navy flash at
// every cut)
const Dissolve: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  // S-curve, so a dark-to-light change (certificates -> cream clients) eases
  // in and out instead of brightening at one steady, flash-like rate
  const o = dur > 0 ? interpolate(f, [0, dur], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) }) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

function musicVolume(scenes: TimedScene[]) {
  // The music dips just ahead of each line (12 frames) and comes back up as
  // the last word ends, over ~0.7 s with an eased curve. It used to stay down
  // for a third of a second after every line and then jump back in 10
  // frames, which left a near-silent hole and an audible swell.
  const ease = Easing.inOut(Easing.sin);
  return (f: number) => {
    let v = MUSIC.volume;
    for (const s of scenes) {
      if (!s.voice) continue;
      const a = s.voice.from, b = s.voice.from + s.voice.durationInFrames;
      if (f > a - 14 && f < b + 24) {
        const k = interpolate(f, [a - 12, a - 2, b - 2, b + 22], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        v = Math.min(v, MUSIC.volume - (MUSIC.volume - MUSIC.duckedVolume) * k);
      }
    }
    // the music eases back ~2.5 dB under KOUNDINYA, so the hero shot lands as
    // a pause after the fleet montage (existing track only - no effects)
    const hero = scenes.find((s) => s.kind === "hero");
    const hush = hero ? interpolate(f, [hero.from - 6, hero.from + 24, hero.from + hero.durationInFrames - 24, hero.from + hero.durationInFrames], [1, 0.75, 0.75, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
    const fadeOut = interpolate(f, [TOTAL_FRAMES - 45, TOTAL_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return v * hush * fadeOut;
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
            <Dissolve dur={dis}>
              <Comp d={s.durationInFrames + (s.from - from)} at={from} scene={s} />
            </Dissolve>
          </Sequence>
        );
      })}
      <Subtitles scenes={scenes} />
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
