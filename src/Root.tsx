import React from "react";
import { Composition } from "remotion";
import { Film } from "./Film";
import { FPS } from "./script";
import { TOTAL_FRAMES } from "./timing";
import { Motion30, MOTION_FRAMES } from "./motion/Motion30";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LibraaFilm" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="LibraaMotion30" component={Motion30} durationInFrames={MOTION_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
