// Burned-in subtitles, timed to the recordings (src/subtitles.generated.json,
// built by `npm run subtitles`). Bottom-centre on a dark band - below the
// lower-left titles, so the two never meet, and readable over bright footage
// and the cream client wall alike. Same face as the rest of the film.
// Render without them:  --props='{"subtitles":false}'
import React from "react";
import { AbsoluteFill, getInputProps, interpolate, Sequence, useCurrentFrame } from "remotion";
import SUBS from "./subtitles.generated.json";
import type { TimedScene } from "./timing";
import { C, FONT, TYPE } from "./ui";

type Cue = { text: string; start: number; end: number };
export const SUBTITLES_ON = (getInputProps() as { subtitles?: boolean }).subtitles !== false;

const Line: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const cue = cues.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  const s = Math.round(cue.start * 30), e = Math.round(cue.end * 30);
  // fade only at the edges of a run of subtitles, never between two of them
  const first = cue === cues[0], last = cue === cues[cues.length - 1];
  const o = interpolate(f, [s, s + 4, e - 4, e], [first ? 0 : 1, 1, 1, last ? 0 : 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 58, opacity: o }}>
      <div
        style={{
          maxWidth: 1400,
          padding: "8px 22px 10px",
          background: "rgba(10,14,42,0.66)",
          fontFamily: FONT,
          fontWeight: TYPE.bodyWeight,
          fontSize: 36,
          lineHeight: 1.3,
          color: C.white,
          textAlign: "center",
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};

export const Subtitles: React.FC<{ scenes: TimedScene[] }> = ({ scenes }) =>
  SUBTITLES_ON ? (
    <>
      {scenes.map((s) => {
        const cues = (SUBS as Record<string, Cue[]>)[s.id];
        if (!s.voice || !cues) return null;
        const len = Math.ceil(cues[cues.length - 1].end * 30) + 2;
        return (
          <Sequence key={`sub-${s.id}`} from={s.voice.from} durationInFrames={len} name={`subs ${s.id}`}>
            <Line cues={cues} />
          </Sequence>
        );
      })}
    </>
  ) : null;
