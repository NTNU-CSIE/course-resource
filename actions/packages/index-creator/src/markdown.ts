export function index_to_markdown(index: Record<string, string[]>, base = "./resources/"): string {
	return Object.entries(index).reduce((acc, [course, years]) => {
		return (
			acc +
			(`* [${course}](${base}${course}/)\n` +
				years.map((year) => `  * [${year}](${base}${course}/${year}/)`).join("\n"))
		);
	}, "");
}

export function inject(body: string, tag: string, content: string): string {
	const start = `<!-- [${tag} START] -->`;
	const end = `<!-- [${tag} END] -->`;

	const start_index = body.indexOf(start);
	const end_index = body.indexOf(end);

	return [body.slice(0, start_index + start.length), content, body.slice(end_index)].join("\n");
}
