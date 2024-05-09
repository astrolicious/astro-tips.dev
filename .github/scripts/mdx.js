// @ts-check

import { toMarkdown } from 'mdast-util-to-markdown';
import { mdxToMarkdown } from 'mdast-util-mdx';
import { readFileSync, readdirSync } from 'node:fs';

/**
 * @param {import('mdast').Heading['depth']} level
 * @param {string} text
 * @returns {import('mdast').Heading}
 */
const heading = (level, text) => {
	return {
		type: 'heading',
		depth: level,
		children: [{ type: 'text', value: text }],
	};
};

/**
 * @param {string} value
 * @returns {import('mdast').Text}
 */
const text = (value) => {
	return {
		type: 'text',
		value,
	};
};

/**
 * @param {import('mdast').Paragraph['children']} children
 * @returns {import('mdast').Paragraph}
 */
const paragraph = (...children) => {
	return {
		type: 'paragraph',
		children: [...children],
	};
};

/**
 * @returns {import('mdast').ListItem}
 */
const listItem = () => {
	return {
		type: 'listItem',
		children: [
			{
				type: 'paragraph',
				children: [
					{
						type: 'text',
						value: 'Test',
					},
				],
			},
		],
	};
};

/**
 * @param {string} href
 * @param {string} text
 * @returns {import('mdast').ListItem}
 */
const listLink = (href, text) => {
	return {
		type: 'listItem',
		children: [
			{
				type: 'paragraph',
				children: [
					{
						type: 'link',
						url: href,
						children: [{ type: 'text', value: text }],
					},
				],
			},
		],
	};
};

/**
 * @param {import('mdast').ListItem[]} listItems
 * @returns {import('mdast').List}
 */
const list = (...listItems) => {
	return {
		type: 'list',
		children: [...listItems],
	};
};

/** @type {import('mdast').Root} */
const mdast = {
	type: 'root',
	children: [
		{
			type: 'html',
			value: `---
title: Community Educational Content
description: Discover community-produced tutorials, guides, articles and videos to help you learn and build with Astro!
i18nReady: true
---`,
		},
		{
			type: 'mdxjsEsm',
			value: "import Badge from '~/components/Badge.astro';",
		},
		paragraph(
			text(
				'There is so much more out there that can help you learn and build with Astro! Here is some educational content produced and maintained by the Astro community.'
			)
		),
		paragraph(
			text(
				'All links are external, and may be based on earlier versions of Astro. Be sure to check the date on any community content, and adapt to your project accordingly.'
			)
		),
		paragraph(
			text('For more Astro educational content, check out '),
			{
				type: 'link',
				url: 'https://astro.build/blog/',
				children: [
					{
						type: 'text',
						value: 'the Astro Blog',
					},
				],
			},
			text(' or sign up for '),
			{
				type: 'link',
				url: 'https://astro.build/newsletter/signup',
				children: [
					{
						type: 'text',
						value: 'the official Astro newsletter',
					},
				],
			},
			text(' where we recap the best community content of each month.')
		),
		heading(2, 'Courses and Tutorials'),
		paragraph(
			text(
				'Courses and tutorials are focused on teaching you new concepts, often with exercises or sample projects to build. These are a great way to learn new concepts and give you the tools you need for working on your own Astro project.'
			)
		),
		paragraph(text('Check out the following courses and tutorials to learn more about Astro.')),
		heading(3, 'Introductory Tutorials'),
		// LIST
		{
			type: 'list',
			children: [
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://www.youtube.com/watch?v=e-hTm5VmofI',
									children: [{ type: 'text', value: 'Astro Web Framework Crash Course' }],
								},
								{ type: 'text', value: ' by freeCodeCamp' },
							],
						},
					],
				},
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://www.youtube.com/watch?v=zrPVTf761OI',
									children: [
										{
											type: 'text',
											value: 'Astro Crash Course in 20 minutes',
										},
									],
								},
								{
									type: 'text',
									value: ' by Chris Pennington (full paid course: ',
								},
								{
									type: 'link',
									url: 'https://learnastro.dev/',
									children: [
										{
											type: 'text',
											value: 'Learn Astro',
										},
									],
								},
								{
									type: 'text',
									value: ')',
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://www.youtube.com/watch?v=qBOz6TpYAOg',
									children: [
										{
											type: 'text',
											value: 'Astro 3.0 Crash Course',
										},
									],
								},
								{
									type: 'text',
									value: ' by James Q Quick (full paid course: ',
								},
								{
									type: 'link',
									url: 'https://astrocourse.dev/',
									children: [
										{
											type: 'text',
											value: 'Build Modern Websites with Astro',
										},
									],
								},
								{
									type: 'text',
									value: ')',
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://www.youtube.com/watch?v=NniT0vKyn-E',
									children: [
										{
											type: 'text',
											value: 'Astro Crash Course in 60 minutes',
										},
									],
								},
								{
									type: 'text',
									value: ' by @developedbyed',
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://www.ohansemmanuel.com/books/understanding-astro',
									children: [
										{
											type: 'text',
											value: 'Understanding Astro (ebook)',
										},
									],
								},
								{
									type: 'text',
									value: ' by Ohans Emmanuel',
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://thevalleyofcode.com/astro',
									children: [
										{
											type: 'text',
											value: 'The Valley of Code - Astro',
										},
									],
								},
								{
									type: 'text',
									value: ' by Flavio Copes',
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://www.youtube.com/watch?v=RB5tR_nqUEw',
									children: [
										{
											type: 'text',
											value:
												'Learn Astro 3 from Scratch: Course for Beginners + Astro Application (SPANISH)',
										},
									],
								},
								{
									type: 'text',
									value: ' by @midudev',
								},
							],
						},
					],
				},
			],
		},
		heading(3, 'Video Tutorials'),
		// LIST
		{
			type: 'list',
			children: [
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://www.youtube.com/watch?v=XoIHKO6AkoM',
									children: [
										{
											type: 'text',
											value: 'Astro Quick Start Course: Build an SSR Blog',
										},
									],
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://www.youtube.com/watch?v=Gvr4WhgfP0w',
									children: [
										{
											type: 'text',
											value: 'How I created a movie application with Astro 3.x',
										},
									],
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://www.youtube.com/watch?v=Fcw4c3wzm7I',
									children: [
										{
											type: 'text',
											value: 'You may not ACTUALLY understand Content Collections…',
										},
									],
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://www.youtube.com/watch?v=OERqwLy_reA',
									children: [
										{
											type: 'text',
											value: 'Build a custom blog platform with Astro and Appwrite',
										},
									],
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://www.youtube.com/watch?v=TwWvNK0yHjI',
									children: [
										{
											type: 'text',
											value: 'Astro JS Portfolio Crash Course',
										},
									],
								},
							],
						},
					],
				},
				{
					type: 'listItem',
					children: [
						{
							type: 'paragraph',
							children: [
								{
									type: 'link',
									url: 'https://egghead.io/courses/build-a-full-stack-blog-with-astro-7ffcf9ec',
									children: [
										{
											type: 'text',
											value: 'Build a full stack blog with Astro',
										},
									],
								},
							],
						},
					],
				},
			],
		},
		heading(2, 'Recipes and Guides'),
		paragraph(
			text(
				'See guided examples of adding features to your Astro project, submitted by our community members!'
			)
		),
		{
			type: 'paragraph',
			children: [
				{
					type: 'link',
					url: '/en/recipes/',
					children: [
						{
							type: 'text',
							value: 'Astro recipes',
						},
					],
				},
				{
					type: 'text',
					value:
						' are typically short, focused how-to guides that walk a reader through completing a working example of a specific task. Recipes are a great way to add new features or behavior to your Astro project by following step-by-step instructions!',
				},
			],
		},
		{
			type: 'paragraph',
			children: [
				{
					type: 'text',
					value:
						'Other guides might explain concepts related to an area of content, such as using images or working with MDX.',
				},
			],
		},
		{
			type: 'paragraph',
			children: [
				{ type: 'html', value: ':::tip[Add your own!]' },
				{ type: 'text', value: '\nHave you written a recipe for Astro? ' },
				{
					type: 'link',
					url: 'https://github.com/withastro/docs/edit/main/src/content/docs/en/community-resources/content.mdx',
					children: [{ type: 'text', value: 'Edit this page' }],
				},
				{ type: 'text', value: ' and add your link in the appropriate section!' },
				{ type: 'html', value: '\n:::' },
			],
		},
		heading(3, 'CSS'),
		list(
			...readdirSync('src/content/resources')
				.filter(
					(file) =>
						JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8')).category === 'css'
				)
				.map((file) => {
					const content = JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8'));
					return listLink(content.link, content.title);
				})
		),
		heading(3, 'Authentication'),
		list(
			...readdirSync('src/content/resources')
				.filter(
					(file) =>
						JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8')).category === 'auth'
				)
				.map((file) => {
					const content = JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8'));
					return listLink(content.link, content.title);
				})
		),
		heading(3, 'RSS'),
		list(
			...readdirSync('src/content/resources')
				.filter(
					(file) =>
						JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8')).category === 'rss'
				)
				.map((file) => {
					const content = JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8'));
					return listLink(content.link, content.title);
				})
		),
		heading(3, 'Images'),
		list(
			...readdirSync('src/content/resources')
				.filter(
					(file) =>
						JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8')).category === 'images'
				)
				.map((file) => {
					const content = JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8'));
					return listLink(content.link, content.title);
				})
		),
		heading(3, 'Editor Tooling'),
		list(
			...readdirSync('src/content/resources')
				.filter(
					(file) =>
						JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8')).category === 'editor'
				)
				.map((file) => {
					const content = JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8'));
					return listLink(content.link, content.title);
				})
		),
		heading(3, 'Markdown'),
		list(
			...readdirSync('src/content/resources')
				.filter(
					(file) =>
						JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8')).category ===
						'markdown'
				)
				.map((file) => {
					const content = JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8'));
					return listLink(content.link, content.title);
				})
		),
		heading(3, 'Performance'),
		list(
			...readdirSync('src/content/resources')
				.filter(
					(file) =>
						JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8')).category ===
						'performance'
				)
				.map((file) => {
					const content = JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8'));
					return listLink(content.link, content.title);
				})
		),
		heading(3, 'Utilities'),
		list(
			...readdirSync('src/content/resources')
				.filter(
					(file) =>
						JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8')).category ===
						'utilities'
				)
				.map((file) => {
					const content = JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8'));
					return listLink(content.link, content.title);
				})
		),
		heading(3, 'Animation'),
		list(
			...readdirSync('src/content/resources')
				.filter(
					(file) =>
						JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8')).category ===
						'animation'
				)
				.map((file) => {
					const content = JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8'));
					return listLink(content.link, content.title);
				})
		),
		heading(3, 'Internationalization and Localization'),
		list(
			...readdirSync('src/content/resources')
				.filter(
					(file) =>
						JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8')).category === 'i18n'
				)
				.map((file) => {
					const content = JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8'));
					return listLink(content.link, content.title);
				})
		),
		heading(3, 'Astro DB'),
		list(
			...readdirSync('src/content/resources')
				.filter(
					(file) =>
						JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8')).category === 'db'
				)
				.map((file) => {
					const content = JSON.parse(readFileSync(`src/content/resources/${file}`, 'utf-8'));
					return listLink(content.link, content.title);
				})
		),
	],
};

const main = async () => {
	const markdown = toMarkdown(mdast, { extensions: [mdxToMarkdown()] });
	console.log(markdown);
};
main();

// /**
//  * @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments
//  */
// export default async ({ github, context, core }) => {
// 	const githubBranch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
// 	const productionEnvironment = githubBranch === 'main';
// 	const environmentName = `[site] (${productionEnvironment ? 'Production' : githubBranch})`;

// 	const deployment = await github.rest.repos.createDeployment({
// 		owner: context.repo.owner,
// 		repo: context.repo.repo,
// 		ref: githubBranch || context.ref,
// 		auto_merge: false,
// 		description: 'Site Cloudflare Pages',
// 		required_contexts: [],
// 		environment: environmentName,
// 		production_environment: productionEnvironment,
// 	});
// 	if (deployment.status === 201) {
// 		core.setOutput('deployment-id', deployment.data.id);
// 	}
// };
