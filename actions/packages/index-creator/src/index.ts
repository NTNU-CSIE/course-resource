import fs from "node:fs";
import path from "node:path";
import { index_to_markdown, inject } from "./markdown";

const ignores = new Set<string>(["CSU0000-範例課程"]);

const root = path.join(__dirname, "..", "..", "..", "..");
const resources = path.join(root, "resources");
const readme = path.join(root, "README.md");

const md = index_to_markdown(create_index());
fs.writeFileSync(readme, inject(fs.readFileSync(readme, "utf-8"), "INDEX", md));
console.log(`Index created successfully.\n${md}`);

function create_index(): Record<string, string[]> {
	return fs
		.readdirSync(resources)
		.filter((f) => fs.statSync(path.join(resources, f)).isDirectory())
		.reduce((acc, course_dir) => {
			if (ignores.has(course_dir)) {
				return acc;
			}

			acc[course_dir] = fs
				.readdirSync(path.join(resources, course_dir))
				.filter((f) => fs.statSync(path.join(resources, course_dir, f)).isDirectory());

			return acc;
		}, {} as Record<string, string[]>);
}
