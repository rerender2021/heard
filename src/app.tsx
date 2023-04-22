import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AveRenderer, Grid, Window, getAppContext, IIconResource, IWindowComponentProps, Button, Label, IButtonComponentProps, TextBox, ComboBox, IComboBoxComponentProps, ITextBoxComponentProps } from "ave-react";
import { App, ThemePredefined_Dark } from "ave-ui";
import { containerLayout, controlLayout } from "./layout";
import { iconResource } from "./resource";
import { safe, sleep } from "./common";
import axios from "axios";
import { ProgressType, Whisper } from "./whisper";
import { useDragDrop } from "./hooks";
import path from "path";
import { getModelList, useModel } from "./config";
import { writeSubtitleFile } from "./utils.ts";

function onInit(app: App) {
	const context = getAppContext();
	context.setIconResource(iconResource as unknown as IIconResource);
}

function initTheme() {
	const context = getAppContext();
	const themeImage = context.getThemeImage();
	const themeDark = new ThemePredefined_Dark();
	themeDark.SetStyle(themeImage, 0);
}

enum Text {
	GenerateSubtitle = "生成字幕",
	OpenFile = "选择文件",
	ProgressLabel = "进度",
}

const modelOptions = getModelList().map((each, index) => {
	return {
		key: `${index + 1}`,
		text: each,
	};
});

export function Heard() {
	const whisper = useMemo(() => new Whisper(), []);
	const onClose = useCallback<IWindowComponentProps["onClose"]>(
		safe(() => {
			whisper.destroy();
		}),
		[]
	);

	const [title, setTitle] = useState("Heard");
	const [whisperReady, setwhisperReady] = useState(false);
	const [src, setSrc] = useState<string>("");
	const [srcDesc, setSrcDesc] = useState<string>("");
	const [srcList, setSrcList] = useState<Array<string>>([""]);
	const promptRef = useRef<string>("");
	useDragDrop((pathList) => {
		setSrcList(pathList);
		setSrcDesc(pathList.length === 1 ? pathList[0] : `${pathList.length} files`);
		setProgressLabelText(`${Text.ProgressLabel}: 0/${pathList.length}`);
	});

	const [progress, setProgress] = useState<ProgressType>(ProgressType.None);
	const [progressText, setProgressText] = useState<string>("");
	const [progressLabelText, setProgressLabelText] = useState<string>(Text.ProgressLabel);
	const [defaultSelectedKey, setDefaultSelectedKey] = useState<string>("1");
	const [hintText, setHintText] = useState<string>("初始化中...");

	const onOpenFile = useCallback<IButtonComponentProps["onClick"]>(
		safe(async () => {
			const context = getAppContext();
			const window = context.getWindow();

			const filePath = await window.GetCommonUi().OpenFile([], "", "", "");
			console.log(`open file: ${filePath}`);

			if (filePath) {
				setSrcList([filePath]);
				setSrcDesc(filePath);
				setProgressLabelText(Text.ProgressLabel);
			}
		}),
		[]
	);

	const onTranscribe = useCallback<IButtonComponentProps["onClick"]>(
		safe(async () => {
			if (progress !== ProgressType.None) {
				return;
			}

			for (let i = 0; i < srcList.length; ++i) {
				try {
					const src = srcList[i];
					setSrc(src);
					setProgressLabelText(`${Text.ProgressLabel}: ${i + 1}/${srcList.length}: ${src}`);
					const response = await whisper.transcribe(src, promptRef.current);
					const data = response.data;
					
					writeSubtitleFile(data, src);
					await sleep(1500);
				} catch (error) {
					console.error(error?.message);
				}
			}
		}),
		[srcList]
	);

	const startWhisper = safe(() => {
		setwhisperReady(true);
		axios.get("http://localhost:8300/gpu").then((response) => {
			if (response.data.gpu === "True") {
				console.log("great! use gpu");
				setTitle("Heard (GPU)");
			} else {
				console.log("gpu is not available");
			}
		});
	});

	const onChangeModel = useCallback<IComboBoxComponentProps["onChange"]>(
		safe((sender) => {
			const index = sender.GetSelection();
			const key = `${index + 1}`;
			setDefaultSelectedKey(key);

			const option = modelOptions.find((each) => each.key === `${key}`);
			console.log(`use model: ${option.text}`);
			useModel(option.text);

			setwhisperReady(false);
			whisper
				.restart()
				.then(startWhisper)
				.catch((reason) => {
					setHintText(reason);
				});
		}),
		[]
	);

	const onChangePrompt = useCallback<ITextBoxComponentProps["onChange"]>(
		safe((sender) => {
			promptRef.current = sender.GetText();
			console.log("update prompt: ", promptRef.current);
		}),
		[]
	);

	useEffect(() => {
		initTheme();
		whisper
			.init()
			.then(startWhisper)
			.catch((reason) => {
				setHintText(reason);
			});
	}, []);

	useEffect(
		safe(() => {
			//
			let start = 0;
			let end = 0;
			whisper.onProgress((type, progressText) => {
				let text = progressText;
				if (type === ProgressType.Start) {
					start = Date.now();
				} else if (type === ProgressType.End) {
					end = Date.now();
					const dt = end - start;
					const dir = `位于文件夹: ${path.dirname(src)}, `;
					const time = `耗时: ${Math.floor(dt / 1000)}s`;
					text = `${progressText} ${dir} ${time}`;
				}
				setProgressText(text);

				if (type === ProgressType.Error || type === ProgressType.End) {
					setProgress(ProgressType.None);
				} else {
					setProgress(type);
				}
			});
		}),
		[src]
	);

	return (
		<Window title={title} size={{ width: 260, height: 350 }} onInit={onInit} onClose={onClose}>
			<Grid style={{ layout: containerLayout }}>
				<Grid style={{ area: containerLayout.areas.control, layout: controlLayout }}>
					<Grid style={{ area: controlLayout.areas.openFile }}>
						<Button text={Text.OpenFile} langKey="OpenFile" iconInfo={{ name: "open-file" }} onClick={onOpenFile}></Button>
					</Grid>
					<Grid style={{ area: controlLayout.areas.filePath, margin: "12dpx 0 0 0" }}>
						<TextBox readonly border={false} text={srcDesc}></TextBox>
					</Grid>
					{whisperReady ? (
						<>
							<Grid style={{ area: controlLayout.areas.selectModel }}>
								<ComboBox options={modelOptions} defaultSelectedKey={defaultSelectedKey} onChange={onChangeModel}></ComboBox>
							</Grid>
							<Grid style={{ area: controlLayout.areas.promptLabel }}>
								<Label text="prompt"></Label>
							</Grid>
							<Grid style={{ area: controlLayout.areas.prompt }}>
								<TextBox ime onChange={onChangePrompt}></TextBox>
							</Grid>
							<Grid style={{ area: controlLayout.areas.generate, margin: "12dpx 0 0 0" }}>
								<Button enable={progress === ProgressType.None} text={Text.GenerateSubtitle} iconInfo={{ name: "cc", size: 16 }} onClick={onTranscribe}></Button>
							</Grid>
							<Grid style={{ area: controlLayout.areas.progressLabel }}>
								<TextBox readonly border={false} text={progressLabelText}></TextBox>
							</Grid>
							<Grid style={{ area: controlLayout.areas.progress }}>
								<TextBox readonly border={false} text={progressText}></TextBox>
							</Grid>
						</>
					) : (
						<Grid style={{ area: controlLayout.areas.hintText }}>
							<Label text={hintText}></Label>
						</Grid>
					)}
				</Grid>
			</Grid>
		</Window>
	);
}

AveRenderer.render(<Heard />);
