<script>
    import { marked } from "marked";
    import { Api } from "../config";
    import {
        selectedMarkdown,
        selectedNode,
        scrolled,
        showItemDetail,
    } from "../stores";

    let scrollContainer;
    const renderer = new marked.Renderer();

    renderer.link = (href, title, text) => {
        if (href.includes("http")) {
            return `<a class="external" target="_blank" href="${href}" title="${text}">${text}</a>`;
        } else {
            let img = getMainImage(`${Api}/resources/${href}`);
            if (img) {
                return `<a class="node-highlite" data-id="${Api}/resources/${href}" title="${text}">${text}(${href})</a><img src="${img}" alt="${text}"></img>`;
            } else {
                return `<a class="node-highlite" data-id="${Api}/resources/${href}" title="${text}">${text}(${href})</a>`;
            }
        }
    };

    // Add a custom rule for parsing footnotes
    const footnoteRE = /\[\^([^\]]+)\]/g;
    let nextFootNoteId = 1;
    let footnotes = {};

    renderer.text = (text) => {
        let output = text;

        // Find all footnotes in the text
        output = output.replace(footnoteRE, (match, noteId) => {
            let footnote = footnotes[noteId];

            if (!footnote) {
                footnote = { id: nextFootNoteId, text: noteId };
                footnotes[noteId] = footnote;
                nextFootNoteId++;
            }

            return `<sup class="footnote-reference" id="footnote-reference-${footnote.id}"><a href="#footnote-${footnote.id}">${footnote.id}</a></sup>`;
        });

        return output;
    };
    const htmlPromise = new Promise((resolve) => {
        const html = marked($selectedMarkdown.markdown, { renderer });
        resolve(html);
    });

    let biblio;
    htmlPromise.then((html) => {
        // Render the footnotes
        const footnotesHTML = Object.values(footnotes)
            .map((footnote) => {
                return `<li id="footnote-${footnote.id}">${footnote.text} <a href="#footnote-reference-${footnote.id}">&#8617;</a></li>`;
            })
            .join("");

        biblio = `<ol class="footnotes">${footnotesHTML}</ol>`;
    });

    $: html = marked($selectedMarkdown.markdown, { renderer });

    function getMainImage(id) {
        let match = $selectedMarkdown.items.filter((d) => d.url == id);
        if (match && match.length > 0) {
            let img = match?.[0].data?.thumbnail_display_urls?.medium;
            return img;
        }
    }

    function handleClick(event) {
        if (event.target.tagName === "A") {
            if (event.target.getAttribute("data-id")) {
                $selectedNode = event.target.getAttribute("data-id");
                event.target.classList.toggle("selected");
            }
        }
    }

    $: if ($selectedNode != null) {
        document.querySelectorAll("a[data-id]").forEach((link) => {
            link.classList.remove("selection");
        });
        let selected = document.querySelector(
            `a[data-id="${$selectedNode.id}"]`
        );
        if (selected) {
            selected.classList.add("selection");
        }
    }

    function handleScroll(event) {
        $scrolled = true;
        $showItemDetail = false;
    }
</script>

<div
    class="markdown"
    bind:this={scrollContainer}
    on:scroll={handleScroll}
    on:click={handleClick}
    on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
            handleClick;
        }
    }}
>
    {@html html}
    <div class="biblio">{@html biblio}</div>
</div>

<style>
    .markdown {
        flex: 2;
        min-width: 250px;
        font-size: 1.5rem;
        padding: 8px;
        padding-right: 0.5rem;
        padding-bottom: 150px;
        overflow: scroll;
    }
</style>
