import { assetsPath } from "../common";

const iconResource = {
	size: [16],
	path: {
		windowIcon: [assetsPath("heard.png")],
		"open-file": [assetsPath("open-file.png")],
		"cc": [assetsPath("cc.png")],
		"theme-light": [assetsPath("sun.png")],
		"theme-dark": [assetsPath("moon.png")]
	},
} as const;

export { iconResource };

export type IconResourceMapType = Record<keyof typeof iconResource.path, number>;
