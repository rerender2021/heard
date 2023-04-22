import path from "path";
import fs from "fs";

export function useModel(name: string) {
	globalConfig.model = name;
}

export function getModel() {
	if (!globalConfig.model) {
		globalConfig.model = getModelList()[0];
	}
	return globalConfig.model;
}

export function getModelList() {
	try {
		// TODO: extract get server dir
		const dir = path.resolve(process.cwd(), "./whisper-gpu-server/model");
		const modelList = fs.readdirSync(dir);
		console.error("get model list", { modelList });
		return modelList;
	} catch (error) {
		console.error("get model failed", error?.message);
		return [];
	}
}

const globalConfig = {
	model: "",
};

// --- user config
export function getSubtitleFormat() {
	try {
		const config = getConfig();
		const format = config?.format ?? defaultConfig.format;
		console.log(`current subtitle format: ${format}`);
		return format;
	} catch (error) {
		console.error("get subtitle format failed", { error });
		return defaultConfig.format;
	}
}

const defaultConfig = {
	format: "srt",
};

function getConfig() {
	const configPath = path.resolve(process.cwd(), "./heard.config.json");
	if (!fs.existsSync(configPath)) {
		console.log(`config not exist at ${configPath}, create it!`);
		fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4), "utf-8");
	}

	try {
		const configJson = JSON.parse(fs.readFileSync(configPath, "utf-8"));
		console.log(`parse config succeed, use it`);
		return configJson;
	} catch (error) {
		console.log(`parse config failed, ${error?.message}, use default config`);
		return defaultConfig;
	}
}
