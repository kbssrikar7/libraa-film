import React from "react";
import { Composition } from "remotion";
import { Film } from "./Film";
import { FPS } from "./script";
import { TOTAL_FRAMES } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition id="LibraaFilm" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
);
