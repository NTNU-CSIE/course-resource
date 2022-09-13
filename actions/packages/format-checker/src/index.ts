import fs from "node:fs";
import path from "node:path";
import pangu from "pangu";

// Needs some test cases.
const COURSE_REGEX = /^[A-Z0-9]{7}(?:-.+)?$/;

const ignores = new Set<string>([]);

const root = path.join(__dirname, "..", "..", "..", "..");
const resources = path.join(root, "resources");

fs.readdirSync(resources)
	.filter((f) => fs.statSync(path.join(resources, f)).isDirectory())
	.forEach((course_dir) => {
		if (ignores.has(course_dir)) {
			return;
		}

		if (!COURSE_REGEX.test(course_dir)) {
			console.error(`Invalid course directory name: ${course_dir}`);
			process.exit(1);
		}

		fs.readdirSync(path.join(resources, course_dir))
			.filter((f) => fs.statSync(path.join(resources, course_dir, f)).isDirectory())
			.forEach((year_dir) => {
				const readme_path = path.join(resources, course_dir, year_dir, "README.md");
				if (!fs.existsSync(readme_path)) {
					console.error(`README.md not found in ${course_dir}/${year_dir}`);
					process.exit(1);
				}

				const readme = fs.readFileSync(readme_path, "utf-8");
				const errors = pangu_check(readme);
				if (errors.length > 0) {
					console.error(`README.md in ${course_dir}/${year_dir} is incorrectly spaced:`);
					errors.forEach((error) => console.error(`  ${error}`));
					process.exit(1);
				}
			});
	});

console.log("Format check passed.");

function pangu_check(content: string): string[] {
	const errors: string[] = [];

	const lines = content.split("\n");
	for (let i = 0; i < lines.length; i++) {
		if (pangu.spacing(lines[i]) !== lines[i]) {
			errors.push(`Line ${i + 1} is incorrectly spaced.`);
		}
	}

	return errors;
}
