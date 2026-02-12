export interface Document {
	id: string;
	title: string;
	metadata: Record<string, string>;
	pdfPath: string;
	plaintextPath: string;
	clue?: string;
	thumbnails: string[];
}

export const documents: Record<string, Document> = {
	"us-patent-2733032": {
		id: "us-patent-2733032",
		title: "U.S. Patent 2,733,032",
		metadata: {
			Year: "1956",
			Title: "Christmas Tree Rotator",
			Pages: "3",
		},
		pdfPath: "/docs/US_Patent_2733032.pdf",
		plaintextPath: "/docs/US_Patent_2733032.md",
		clue: "The original patent makes NO MENTION of the electric motor, music box, or outlets for lights.",
		thumbnails: [
			"/docs/thumbnails/US_Patent_2733032-page-1.png",
			"/docs/thumbnails/US_Patent_2733032-page-2.png",
			"/docs/thumbnails/US_Patent_2733032-page-3.png",
		],
	},
	"us-patent-2847175": {
		id: "us-patent-2847175",
		title: "U.S. Patent 2,847,175",
		metadata: {
			Year: "1958",
			Title: "Revolving Stand",
			Assignee: "Spincraft, Inc.",
			Pages: "3",
		},
		pdfPath: "/docs/US_Patent_2847175.pdf",
		plaintextPath: "/docs/US_Patent_2847175.md",
		clue: "This patent DOES mention illumination, lights, and a music box—filed 2 years after the first!",
		thumbnails: [
			"/docs/thumbnails/US_Patent_2847175-page-1.png",
			"/docs/thumbnails/US_Patent_2847175-page-2.png",
			"/docs/thumbnails/US_Patent_2847175-page-3.png",
		],
	},
};

export function getDocument(id: string): Document {
	const doc = documents[id];
	if (!doc) {
		throw new Error(`Unknown document: "${id}". Available: ${Object.keys(documents).join(", ")}`);
	}
	return doc;
}
