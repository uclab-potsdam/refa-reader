export const fetchMarkdownData = async () => {
    const allPostFiles = import.meta.glob('/src/routes/texts/*.md')
    const iterablePostFiles = Object.entries(allPostFiles)

    const allPosts = await Promise.all(
        iterablePostFiles.map(async ([path, resolver]) => {
            const resolvedPost = await resolver();
            const { html } = resolvedPost.default.render();
            const postPath = path.slice(17, -3)
            return {
                meta: resolvedPost.metadata,
                path: postPath,
                text: html,
            }
        })
    )

    return allPosts
}
