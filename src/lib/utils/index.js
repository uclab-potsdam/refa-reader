export const fetchMarkdownData = async () => {
    const allPostFiles = import.meta.glob('/src/routes/texts/*.md')
    const iterablePostFiles = Object.entries(allPostFiles)

    const allPosts = await Promise.all(
        iterablePostFiles.map(async ([path, resolver]) => {
            const resolvedPost = await resolver();
            const { html } = resolvedPost.default.render();
            const postPath = path.slice(17, -3)

            // get link ids
            const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;

            const links = [...html.matchAll(linkRegex)]
                .map((match) => match[2])
                .filter((link) => !link.startsWith('http'))
                .map((link) => {
                    const lastSlashIndex = link.lastIndexOf('/');
                    return lastSlashIndex !== -1 ? link.substring(lastSlashIndex + 1) : link;
                });

            return {
                meta: resolvedPost.metadata,
                path: postPath,
                text: html,
                links,
            }

        })
    )

    return allPosts
}
