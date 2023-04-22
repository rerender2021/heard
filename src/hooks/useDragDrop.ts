import { getAppContext } from "ave-react";
import { useEffect, useState } from "react";
import { DragDropImage, DropBehavior } from "ave-ui";
import { safe } from "../common";

export function useDragDrop(onPathChange?: (pathList: Array<string>) => void) {
	const [pathList, setPathList] = useState([""]);

	useEffect(() => {
		const context = getAppContext();
		const window = context.getWindow();

		window.OnDragMove(
			safe((sender, dc) => {
				const fileCount = dc.FileGetCount();
				dc.SetDropTip(DragDropImage.Copy, fileCount === 1 ? "选择此文件" : `选择文件x${fileCount}`);
				dc.SetDropBehavior(DropBehavior.Copy);
			})
		);

		window.OnDragDrop(
			safe((sender, dc) => {
				const filePaths = dc.FileGet();
				console.log(`on drap drop, file paths:`, { filePaths });
				setPathList(filePaths);
				onPathChange?.(filePaths ?? [""]);
			})
		);
	}, []);

	return { pathList };
}
