<script>
	import { onMount } from 'svelte';
	import { selectedNode, hoverNode, selectedNodeUniqueId } from '@stores';
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
				let uniqueId = newUniqueId();
				return `<a class="node-highlite" unique-id="${uniqueId}" id="item_${
					href.split('/')[1]
				}" data-id="${
					href.split('/')[1]
				}" title="${text}">${text}<span class="symbol node" unique-id="${uniqueId}" data-id="${
					href.split('/')[1]
				}"
				data-class="${items
					.filter((d) => d.label == text)
					.map((d) => {
						return d.data?.['@type']?.[1];
					})}">
					●
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

		if (window.location.hash) {
			let hash = window.location.hash;

			let target = document.querySelector(hash);
			if (target) {
				target.scrollIntoView({ block: 'center' });
				$selectedNode = target.getAttribute('data-id');
			}
		}
	});

	function handleClick(event) {
		if (event.target.tagName === 'A') {
			if (event.target.getAttribute('data-id')) {
				$selectedNode = event.target.getAttribute('data-id');
				$hoverNode = event.target.getAttribute('data-id');
				event.target.classList.add('selected');
				$selectedNodeUniqueId = event.target.getAttribute('unique-id');
			}
		}
	}

	$: {
		if ($selectedNode != null && typeof document !== 'undefined') {
			document.querySelectorAll('a[data-id]').forEach((link) => {
				link.classList.remove('related');
				link.classList.remove('selected');
			});

			let selectedId = document.querySelectorAll(`a[data-id="${$selectedNode}"]`);
			let selectedUnique = document.querySelectorAll(`a[unique-id="${$selectedNodeUniqueId}"]`);

			if (selectedUnique) {
				// $selectedNode == $selectedNode;
				selectedUnique.forEach((link) => {
					link.classList.add('selected');
					$hoverNode = $selectedNode;
				});
			}
			if (selectedId) {
				// $selectedNode == $selectedNode;
				selectedId.forEach((link) => {
					link.classList.add('related');
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
		font-size: 1.4rem;
		line-height: 1.3;
		text-shadow: 1px 1px 15px white;
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
		text-shadow: none;
	}

	:global(em .node-highlite) {
		font-style: italic;
	}
	:global(.node-highlite span) {
		font-style: normal;
	}

	:global(.related) {
		color: var(--theme-color) !important;
	}

	:global(.selected) {
		background-color: var(--theme-color) !important;
	}
	
	:global(.markdown .selected) {
		color: white !important;
	}
	
	:global(.selected .symbol) {
		color: white;
	}

	:global(.symbol) {
		font-size: 1em;
		line-height: 0;
		vertical-align: middle;
		color: var(--theme-color);
	}



	:global(sup) {
		padding-right: 0.5rem;
		line-height: 0;
	}

	:global(sup ~ span) {
		display: none;
	}

	:global(sup a) {
		text-decoration: none !important;
		color: var(--theme-color) !important;
	}
</style>
