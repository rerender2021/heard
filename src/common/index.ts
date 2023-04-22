import path from "path";

export function assetsPath(name: string) {
	const root = path.resolve(__dirname, "../../assets");
	return path.resolve(root, `./${name}`);
}

export function safe<T extends Function>(callback: T): T {
	const f = (...args: any[]) => {
		try {
			return callback(...args);
		} catch (error) {
			console.error(error);
		}
	}
	return f as unknown as T;
}

export async function sleep(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}