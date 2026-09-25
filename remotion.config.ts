import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setConcurrency(4);
// tag the master as HD (BT.709) so every display interprets colour the same
Config.setColorSpace("bt709");
