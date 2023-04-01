export const containerLayout = {
	columns: `16dpx 1 16dpx`,
	rows: `1`,
	areas: {
		control: { row: 0, column: 1 },
	},
};

export const controlLayout = {
	columns: `1 1 1 1 1 1 1 1`,
	// prettier-ignore
	rows: [
		"16dpx", /* open file */ 		"32dpx", 
		"16dpx", /* prompt  */ 			"32dpx",  
		"16dpx", /* generate  */ 		"32dpx",  
		"16dpx", /* progress label  */  "32dpx", 
		"4dpx",  /* progress  */  		"32dpx",
	].join(" "),
	areas: {
		openFile: { row: 1, column: 0, columnSpan: 4 },
		filePath: { row: 1, column: 4, columnSpan: 4 },

		hintText: { row: 3, column: 0, columnSpan: 8 },
		promptLabel: { row: 3, column: 0, columnSpan: 2 },
		prompt: { row: 3, column: 2, columnSpan: 6 },

		selectModel: { row: 5, column: 0, columnSpan: 3 },
		generate: { row: 5, column: 3, columnSpan: 5 },

		progressLabel: { row: 7, column: 0, columnSpan: 8 },
		progress: { row: 9, column: 0, columnSpan: 8 }
	},
};
