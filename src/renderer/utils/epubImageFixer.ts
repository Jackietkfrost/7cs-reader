/**
 * Resolves relative asset paths in EPUB documents to zip-root relative paths
 * suitable for `book.archive.createUrl(...)`.
 */
export function resolveEpubAssetPath(sectionHref: string, rawSrc: string): string {
    if (!rawSrc) return ""
    let clean = rawSrc.replace(/^file:\/\/\/?/, "")
    clean = clean.split(/[?#]/)[0]

    const cleanSection = sectionHref.replace(/^file:\/\/\/?/, "").split(/[?#]/)[0]
    const lastSlash = cleanSection.lastIndexOf("/")
    const sectionDir = lastSlash >= 0 ? cleanSection.substring(0, lastSlash + 1) : ""

    const combined = clean.startsWith("/") ? clean.slice(1) : sectionDir + clean
    const segments = combined.split("/")
    const stack: string[] = []
    for (const seg of segments) {
        if (!seg || seg === ".") continue
        if (seg === "..") {
            if (stack.length > 0) stack.pop()
        } else {
            stack.push(seg)
        }
    }
    return stack.join("/")
}

/**
 * Fixes broken relative image sources in an EPUB rendered section document
 * by resolving them against the archive zip and replacing src with blob URLs.
 */
export async function fixEpubImages(contents: any, book: any): Promise<void> {
    if (!contents || !book) return
    const doc = contents.document || contents
    if (!doc || typeof doc.querySelectorAll !== "function") return

    const images = Array.from(doc.querySelectorAll("img, image")) as HTMLElement[]
    if (images.length === 0) return

    const sectionHref = contents.section?.href || contents.section?.url || ""

    for (const img of images) {
        const isSvg = img.tagName.toLowerCase() === "image"
        const raw = isSvg
            ? img.getAttribute("xlink:href") || img.getAttribute("href")
            : img.getAttribute("src")

        if (!raw || raw.startsWith("blob:") || raw.startsWith("data:")) {
            continue
        }

        const canonical = resolveEpubAssetPath(sectionHref, raw)
        if (!canonical) continue

        const archivePath = canonical.startsWith("/") ? canonical : "/" + canonical
        try {
            let blobUrl: string | null = null
            if (book.archive && typeof book.archive.createUrl === "function") {
                try {
                    blobUrl = await book.archive.createUrl(archivePath)
                } catch {
                    try {
                        blobUrl = await book.archive.createUrl(canonical)
                    } catch {
                        // ignore
                    }
                }
            }

            if (!blobUrl && book.resources && typeof book.resources.get === "function") {
                try {
                    blobUrl = await book.resources.get(canonical)
                } catch {
                    // ignore
                }
            }

            if (!blobUrl && typeof book.load === "function") {
                try {
                    const blob = await book.load(canonical, "blob")
                    if (blob instanceof Blob) {
                        blobUrl = URL.createObjectURL(blob)
                    }
                } catch {
                    // ignore
                }
            }

            if (blobUrl) {
                if (isSvg) {
                    img.setAttribute("xlink:href", blobUrl)
                    img.setAttribute("href", blobUrl)
                } else {
                    img.setAttribute("src", blobUrl)
                    ;(img as HTMLImageElement).src = blobUrl
                }
            }
        } catch {
            // Keep going if a single asset fails
        }
    }
}
