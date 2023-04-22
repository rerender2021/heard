import path from "path";
import fs from "fs";
import { getSubtitleFormat } from "../config";
import { safe } from "../common";

interface ISubtitleData {
	result: {
		text: string;
		language: string;
		segments: ISubtitleSegment[];
	};
}

interface ISubtitleSegment {
	id: number;
	seek: number;
	start: number;
	end: number;
	text: string;
	tokens: number[];
	temperature: number;
	avg_logprob: number;
	compression_ratio: number;
	no_speech_prob: number;
}

export const writeSubtitleFile = safe((data: ISubtitleData, src: string) => {
	const dirName = path.dirname(src);
	const fileName = path.basename(src);
	const outPath = path.resolve(dirName, `${fileName}.subtitle.json`);
	fs.writeFileSync(outPath, JSON.stringify(data, null, 4), "utf8");

	const parsed = path.parse(fileName); // en.wav
	const baseName = parsed.name; // en
	const extension = parsed.ext; // .wav
	console.log(`save subtitle json`, { dirName, fileName, baseName, extension });

	const format = getSubtitleFormat();
	if (format === "txt") {
		const txtPath = path.resolve(dirName, `${baseName}.txt`);
		const txtContent = getTxtContent(data);
		fs.writeFileSync(txtPath, txtContent, "utf8");
		console.log(`write txt subtitle succeed`);

		const srtPath = path.resolve(dirName, `${baseName}.srt`);
		if (fs.existsSync(srtPath)) {
			fs.unlinkSync(srtPath);
		}
	}
});

function getTxtContent(data: ISubtitleData) {
	return data.result.segments.map((each) => each.text).join("\n");
}
