import { getAppContext } from "ave-react";
import { useEffect, useState } from "react";
import { DragDropImage, DropBehavior } from "ave-ui";

export function useDragDrop(onPathChange?: (path: string) => void) {
	const [path, setPath] = useState("");

	useEffect(() => {
		const context = getAppContext();
		const window = context.getWindow();

		window.OnDragMove((sender, dc) => {
			if (1 === dc.FileGetCount()) {
				dc.SetDropTip(DragDropImage.Copy, "打开此文件");
				dc.SetDropBehavior(DropBehavior.Copy);
			}
		});

		window.OnDragDrop((sender, dc) => {
			const filePath = dc.FileGet()[0];
			setPath(path);
			onPathChange?.(filePath ?? "");
		});
	}, []);

	return { path };
}
