import { base } from '$app/paths';

export const load = async ({ fetch }) => {
    const response = await fetch(`${base}/api/posts`)
    const posts = await response.json()

    return {
        posts
    }
}