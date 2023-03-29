import axios from "axios";
import path from "path";
import fs from "fs";
import childProcess from "child_process";
import { getModel } from "../config";

export enum ProgressType {
	None,
	DetectLang,
	Start,
	Wip,
	End,
	Error,
}

export type OnProgressCallback = (type: ProgressType, text: string) => void;

export class Whisper {
	private server: childProcess.ChildProcessWithoutNullStreams;
	private onProgressCallback: OnProgressCallback = () => {};

	onProgress(callback: OnProgressCallback) {
		this.onProgressCallback = callback;
	}

	async transcribe(inputFile: string, initial_prompt = "") {
		try {
			const outputDirectory = path.dirname(inputFile);
			console.log(`transcribe params:`, { inputFile, outputDirectory, initial_prompt });
			const result = axios.post(
				"http://localhost:8300/transcribe",
				{
					input_file: inputFile,
					output_directory: outputDirectory,
					initial_prompt,
				},
				{ timeout: 0 }
			);
			return result;
		} catch (error) {
			console.log(`transcribe failed: ${error?.message}`);
		}
	}

	async restart() {
		if (this.server) {
			console.log("restart whisper server process");
			process.kill(this.server?.pid);
		}
		await this.init();
	}

	async init() {
		console.log("try to init whisper server");
		const dir = path.resolve(process.cwd(), "whisper-gpu-server");
		const exePath = path.resolve(dir, "./Whisper-API.exe");
		if (fs.existsSync(dir) && fs.existsSync(exePath)) {
			return new Promise((resolve, reject) => {
				console.log("asrDir exists, start asr server", dir);

				const name = getModel();
				console.log("start whisper server with model: ", name);

				const server = childProcess.spawn(exePath, [`--model-path=.\\model\\${name}`], { windowsHide: true, detached: false /** hide console */ });
				this.server = server;
				server.stdout.on("data", (data: Buffer) => {
					const str = data.toString();
					if (str.includes("ERROR : CUDA out of memory")) {
						const errorText = "初始化失败! 显存不足，详细原因请查看 error.log。";
						fs.writeFileSync("./error.log", str, "utf8");
						reject(errorText);
					}

					if (!str.startsWith("__progress__")) {
						console.log(`stdout: ${str}`);
					}

					if (str.includes("has been started")) {
						console.log("whisper server started");
						resolve(true);
					}

					if (str.includes("INFO : transcribe start")) {
						this.onProgressCallback(ProgressType.Start, "开始生成字幕");
					} else if (str.includes("INFO : transcribe end in")) {
						this.onProgressCallback(ProgressType.End, "成功生成字幕!");
					} else if (str.startsWith("Detect")) {
						this.onProgressCallback(ProgressType.DetectLang, str);
					} else if (str.startsWith("__progress__")) {
						const progressList = str
							.split("\r\n")
							.map((each) => each.trim())
							.filter((each) => Boolean(each))
							.map((each) => {
								const [_, str] = each.split(" ");
								const progress = Buffer.from(str.replace("b", ""), "base64").toString();
								return progress;
							});
						console.log({ progressList });
						const progress = progressList[progressList.length - 1] || "";
						if (progress) {
							this.onProgressCallback(ProgressType.Wip, progress);
						}
					}
				});

				server.stderr.on("data", (data) => {
					const str = data.toString();
					console.error(`stderr: ${str}`);

					if (str.includes("Exception in ASGI application")) {
						this.onProgressCallback(ProgressType.Error, "生成字幕失败! 原因请查看 error.log。");
						fs.writeFileSync("./error.log", str, "utf8");
					}
				});

				server.on("close", (code) => {
					const text = `whisper server exit: ${code}`;
					console.log(text);
					reject(text);
				});
			});
		} else {
			console.log("whisper server not exist");
		}
	}

	async destroy() {
		if (this.server) {
			console.log("exit whisper server process");
			process.kill(this.server?.pid);
			process.exit();
		}
	}
}
