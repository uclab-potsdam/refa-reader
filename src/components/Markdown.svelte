<script>
	import { onMount } from 'svelte';
	import { selectedNode, customIcons } from '@stores';
	import { observe } from '@utils';
	import newUniqueId from 'locally-unique-id-generator';

	export let data;
	export let items;

	let htmlText = data.text;
	const footnoteRegex = /\[\^([^\]]+)\]/g;
	let footnoteCounter = 1;

	function getMainImage(id) {
		let match = items.filter((d) => d.data?.['o:id'] == id);

		if (match && match.length > 0) {
			let img = match?.[0].data?.thumbnail_display_urls?.medium;
			return img;
		}
	}

	const htmlWithCustomLinks = htmlText.replace(
		/<a\s+href="([^"]+)"\s*>([^<]+)<\/a>/g,
		(match, href, text) => {
			if (href.startsWith('http')) {
				return `<a class="external" target="_blank" href="${href}" title="${text}">${text}</a>`;
			} else {
				return `<a class="node-highlite" unique-id="${newUniqueId()}" data-id="${
					href.split('/')[1]
				}" title="${text}">${text}<span class="symbol node" data-id="${href.split('/')[1]}"
				data-class="${items
					.filter((d) => d.label == text)
					.map((d) => {
						return d.data?.['@type']?.[1];
					})}">
					${
						customIcons[
							items
								.filter((d) => d.label == text)
								.map((d) => {
									return d.data?.['@type']?.[1];
								})
						]
							? customIcons[
									items
										.filter((d) => d.label == text)
										.map((d) => {
											return d.data?.['@type']?.[1];
										})
							  ]
							: '●'
					}
					</span></a>`;
			}
		}
	);

	const htmlWithFootnotes = htmlWithCustomLinks.replace(footnoteRegex, (match, footnoteText) => {
		const footnoteNumber = footnoteCounter++;
		return `<sup id="fn-${footnoteNumber}"><a href="#fnref-${footnoteNumber}">${footnoteNumber}</a></sup><span id="fn-${footnoteNumber}-content">${footnoteText}</span>`;
	});

	const footnotes = Array.from({ length: footnoteCounter - 1 }, (_, i) => {
		const footnoteNumber = i + 1;
		const footnoteContent = htmlWithFootnotes.match(
			new RegExp(`<span id="fn-${footnoteNumber}-content">([^<]+)<\/span>`)
		)[1];
		return `<li id="fnref-${footnoteNumber}"> ${footnoteContent}</li>`;
	}).join('');
	const finalHtml = `${htmlWithFootnotes}<ol class="biblio">${footnotes}</ol>`;

	onMount(async () => {
		observe();
	});

	function handleClick(event) {
		if (event.target.tagName === 'A') {
			if (event.target.getAttribute('data-id')) {
				$selectedNode = event.target.getAttribute('data-id');
				event.target.classList.toggle('selected');
			}
		}
	}

	$: {
		if ($selectedNode != null && typeof document !== 'undefined') {
			document.querySelectorAll('a[data-id]').forEach((link) => {
				link.classList.remove('selected');
			});

			let selected = document.querySelectorAll(`a[data-id="${$selectedNode}"]`);

			if (selected) {
				$selectedNode == $selectedNode;
				selected.forEach((link) => {
					link.classList.add('selected');
				});
			}
		}
	}
</script>

<div class="markdown" on:click={handleClick} on:keydown={handleClick}>
	{@html finalHtml}
</div>

<style>
	.markdown {
		padding-bottom: 40vh;
		padding-top: 5vh;
		font-size: 1.3rem;
		line-height: 1.3;
	}

	:global(a) {
		color: var(--theme-color);
		cursor: pointer;
	}

	:global(.markdown a) {
		color: black;
		font-size: 0.9em;
		text-decoration: underline;
		text-underline-offset: 2px;
		text-decoration-color: var(--theme-color);
	}

	:global(.node-highlite) {
		font-family: 'Inter', sans-serif;
		font-weight: 450;
		font-style: normal;
		font-size: 0.7em !important;
		color: black;
		background-color: #f2f2f2;
		cursor: pointer;
		border-radius: 2px;
		padding: 2px;
		text-decoration: unset !important;
	}

	:global(em .node-highlite ) {
		font-style: italic;		
	}
	:global(.node-highlite span) {
		font-style: normal;		
	}

	:global(.selected) {
		background-color: var(--theme-color);
		mix-blend-mode: color-burn;
		/* background: linear-gradient(to right, #f2f2f2, var(--theme-color)); */
	}

	:global(.markdown .selected) {
		color: white !important;
	}

	:global(.symbol) {
		font-size: 1em;
		line-height: 0;
		vertical-align: middle;
		color: var(--theme-color);
		padding-left: 0.25rem;
	}

	:global(.selected .symbol) {
		color: white;
	}

	:global(sup) {
		padding-right: 0.5rem;
	}

	:global(sup ~ span) {
		display: none;
	}

	:global(sup a) {
		text-decoration: none;
		color: var(--theme-color);
	}
</style>
