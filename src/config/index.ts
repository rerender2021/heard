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
