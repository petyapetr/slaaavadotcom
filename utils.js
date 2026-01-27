import path from "node:path";
import {writeFileSync, readdirSync, readFileSync} from "node:fs";
import {mkdir} from "node:fs/promises";
import nunjucks from "nunjucks";
import {marked} from "marked";
import JSON5 from "json5";

const njk = new nunjucks.Environment(
	new nunjucks.FileSystemLoader("src/pages")
);
njk.addFilter("tokenizeHeading", (heading) => {
	return encodeURI(heading.toLowerCase().split(" ").join("_"));
});
njk.addFilter("formatDate", (dateString) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
});

marked.use({
	renderer: {
		heading(token) {
			const id = encodeURI(token.text.toLowerCase().split(" ").join("_"));
			if (token.depth === 1) return `<h1 id="${id}">${token.text}</h1>\n`;

			return `<h${token.depth} class="heading" id="${id}">${token.text}<button type="button" data-anchor="${id}"><svg aria-hidden="true" viewBox="0 0 24 24">
					<title aria-hidden="true">Copy Anchor “${token.text}”</title>
					<use href="/assets/icons.svg#link"></use>
				</svg>
			</button>
			</h${token.depth}>\n`;
		},
	},
});

export class SiteBuilder {
	constructor() {
		this.routes = [];
		this.collections = new Map();
		this.njk = njk;
	}

	collection = (dir, template, group, clause) => {
		const files = readdirSync(dir).map((file) => path.join(dir, file));
		const items = files
			.map((file) => {
				const ext = path.extname(file);
				const slug = file.replace(ext, "").replace("content", "");
				const source = readFileSync(file, "utf-8");
				const {data, content} = parseFrontmatter(source);
				return {slug, ext, content, ...data};
			})
			.filter(clause);
		this.collections.set(group, {items, template, group});
	};

	page = (path, handler) => {
		this.routes.push({path, handler});
	};

	build = async () => {
		for (const collection of this.collections.values()) {
			for (const {ext, content, slug, ...data} of collection.items) {
				const handler = this.getHandler(ext);
				this.page(slug + "/", () =>
					handler(
						{content, group: collection.group, ...data, slug},
						collection.template
					)
				);
			}
		}
		for (const {path, handler} of this.routes) {
			const filePath = this.createFilePath(path);
			const content = await handler();
			await this.writeFile(filePath, content);
		}
	};

	createFilePath = (path) => {
		if (path === "/") return "dist/index.html";
		if (path.endsWith("/")) return `dist${path}index.html`;
		return `dist${path}.html`;
	};

	writeFile = async (path, content) => {
		const dir = path.substring(0, path.lastIndexOf("/"));
		await mkdir(dir, {recursive: true});
		writeFileSync(path, content);
		console.log(`↝ ${path}`);
	};

	getHandler = (ext) => {
		if (ext === ".md") {
			return mdRenderer;
		}
		return jinjaRenderer;
	};
}

export function parseFrontmatter(source) {
	const lines = source.split("\n");
	if (!lines[0].startsWith("+++")) {
		return {data: {}, content: source};
	}
	const closingIndex = lines.slice(1).findIndex((line) => line === "+++");
	if (closingIndex === -1) {
		return {data: {}, content: source};
	}
	const frontmatter = lines.slice(1, closingIndex + 1).join("\n");
	const content = lines.slice(closingIndex + 2).join("\n");
	if (lines[0].endsWith("json")) {
		const data = JSON5.parse(frontmatter);
		return {data, content};
	}
	return {data: {}, content};
}

export function mdRenderer(context, template) {
	const {content, ...data} = context;
	const md = njk.renderString(content, data);
	const parsed = marked.parse(md);
	return jinjaRenderer({content: parsed, ...data}, template);
}

export function jinjaRenderer(context, template = "_includes/base.html") {
	return njk.render(template, context);
}
