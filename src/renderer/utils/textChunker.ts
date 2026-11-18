export interface SpeechChunk {
    id: number
    rawText: string
    spokenText: string
    isHeading: boolean
    isParagraphEnd: boolean
    blockElement: any
    startOffset: number
    endOffset: number
}

export interface SentenceSpan {
    text: string
    start: number
    end: number
}

export interface HighlightStyle {
    background: string
    color: string
    outline: string
    reducedMotion: boolean
}

const NON_TERMINAL_ABBREVIATIONS = new Set([
    "mr",
    "mrs",
    "ms",
    "dr",
    "prof",
    "sr",
    "jr",
    "st",
    "rev",
    "gen",
    "col",
    "lt",
    "sgt",
    "capt",
    "hon",
    "vs",
    "eg",
    "ie",
    "ch",
    "fig",
    "no",
    "vol",
    "p",
    "pp"
])

const CONTEXTUAL_ABBREVIATIONS = new Set(["etc", "inc", "ltd", "co"])

const ABBREVIATION_EXPANSIONS: Array<[RegExp, string]> = [
    [/\bMr\./g, "Mister"],
    [/\bMrs\./g, "Missus"],
    [/\bMs\./g, "Miss"],
    [/\bDr\./g, "Doctor"],
    [/\bProf\./g, "Professor"],
    [/\bSt\./g, "Saint"],
    [/\bSr\./g, "Senior"],
    [/\bJr\./g, "Junior"],
    [/\bvs\./gi, "versus"],
    [/\betc\./gi, "et cetera"],
    [/\be\.g\./gi, "for example"],
    [/\bi\.e\./gi, "that is"],
    [/\bCh\./g, "Chapter"],
    [/\bFig\./g, "Figure"],
    [/\bNo\./g, "Number"],
    [/\bpp\./g, "pages"],
    [/\bp\./g, "page"]
]

export function cleanTextForSpeech(input: string): string {
    let text = input
        .replace(/\u00AD/g, "")
        .replace(/([A-Za-z])-\s*\r?\n\s*([A-Za-z])/g, "$1$2")
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/\[\s*\d+\s*\]/g, "")
        .replace(/[†‡§¶]/g, "")
        .replace(/(?:[*_~•·=-]\s*){3,}/g, " ")

    for (const [pattern, replacement] of ABBREVIATION_EXPANSIONS) {
        text = text.replace(pattern, replacement)
    }

    return text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim()
}

function isNonBreakingDot(text: string, dotIndex: number): boolean {
    const prevChar = dotIndex > 0 ? text[dotIndex - 1] : ""
    const nextChar = dotIndex + 1 < text.length ? text[dotIndex + 1] : ""

    if (/\d/.test(prevChar) && /\d/.test(nextChar)) {
        return true
    }

    if (/[A-Za-z0-9]/.test(prevChar) && /[A-Za-z0-9]/.test(nextChar)) {
        return true
    }

    const before = text.slice(Math.max(0, dotIndex - 12), dotIndex)
    const dottedAbbrev = before.match(/(?:^|\s)([A-Za-z]\.[A-Za-z])$/)
    if (dottedAbbrev) {
        return true
    }

    const wordMatch = before.match(/(?:^|[\s([{"'])([A-Za-z]{1,5})$/)
    if (!wordMatch) {
        return false
    }

    const rawWord = wordMatch[1]
    const word = rawWord.toLowerCase()
    if (NON_TERMINAL_ABBREVIATIONS.has(word)) {
        return true
    }

    if (CONTEXTUAL_ABBREVIATIONS.has(word)) {
        const afterWhitespace = text.slice(dotIndex + 1).match(/^\s+([A-Za-z])/)
        return Boolean(afterWhitespace && /^[a-z]$/.test(afterWhitespace[1]))
    }

    return rawWord.length === 1 && rawWord === rawWord.toUpperCase() && /[A-Z]/.test(rawWord)
}

export function splitIntoSentences(text: string): SentenceSpan[] {
    const spans: SentenceSpan[] = []
    const length = text.length
    let start = 0

    while (start < length && /\s/.test(text[start])) {
        start++
    }

    let i = start
    while (i < length) {
        const ch = text[i]
        const isTerminal = ch === "." || ch === "!" || ch === "?"

        if (isTerminal) {
            if (ch === ".") {
                const nextChar = i + 1 < length ? text[i + 1] : ""
                if (nextChar === ".") {
                    while (i + 1 < length && text[i + 1] === ".") {
                        i++
                    }
                } else if (isNonBreakingDot(text, i)) {
                    i++
                    continue
                }
            }

            let end = i + 1
            let hadClosingQuote = false
            while (end < length && /["'”’)\]}]/.test(text[end])) {
                if (/["'”’]/.test(text[end])) {
                    hadClosingQuote = true
                }
                end++
            }

            if (hadClosingQuote && (ch === "?" || ch === "!")) {
                const nextWordMatch = text.slice(end).match(/^\s+([a-z])/)
                if (nextWordMatch) {
                    i = end
                    continue
                }
            }

            const atEnd = end >= length
            const followedBySpace = !atEnd && /\s/.test(text[end])

            if (atEnd || followedBySpace) {
                const slice = text.slice(start, end).trim()
                if (slice.length > 0) {
                    const leadingTrim = text.slice(start, end).search(/\S/)
                    const actualStart = start + (leadingTrim >= 0 ? leadingTrim : 0)
                    spans.push({
                        text: slice,
                        start: actualStart,
                        end: actualStart + slice.length
                    })
                }
                start = end
                while (start < length && /\s/.test(text[start])) {
                    start++
                }
                i = start
                continue
            }
        }
        i++
    }

    if (start < length) {
        const tail = text.slice(start).trim()
        if (tail.length > 0) {
            const leadingTrim = text.slice(start).search(/\S/)
            const actualStart = start + (leadingTrim >= 0 ? leadingTrim : 0)
            spans.push({
                text: tail,
                start: actualStart,
                end: actualStart + tail.length
            })
        }
    }

    return spans
}

const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"])
const BLOCK_SELECTOR = "h1, h2, h3, h4, h5, h6, p, li, blockquote, dt, dd, figcaption"

function isElementVisibleInViewport(el: any, win: any): boolean {
    if (!el || typeof el.getBoundingClientRect !== "function" || !win) {
        return true
    }
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
        return false
    }
    const viewWidth = win.innerWidth || 0
    const viewHeight = win.innerHeight || 0
    if (viewWidth === 0 || viewHeight === 0) {
        return true
    }
    const intersectsHorizontally = rect.right > 2 && rect.left < viewWidth - 2
    const intersectsVertically = rect.bottom > 2 && rect.top < viewHeight - 2
    return intersectsHorizontally && intersectsVertically
}

function collectReadableBlocks(doc: any): any[] {
    if (!doc?.body) {
        return []
    }
    const candidates = Array.from(doc.body.querySelectorAll(BLOCK_SELECTOR)) as any[]
    const leafBlocks = candidates.filter((el) => {
        if (!el.textContent || !el.textContent.trim()) {
            return false
        }
        const nested = el.querySelector(BLOCK_SELECTOR)
        return !nested
    })

    if (leafBlocks.length === 0) {
        return [doc.body]
    }

    const win = doc.defaultView
    const visibleBlocks = leafBlocks.filter((el) => isElementVisibleInViewport(el, win))
    return visibleBlocks.length > 0 ? visibleBlocks : leafBlocks
}

export function extractDocumentChunks(
    doc: any,
    options: { cleanupFormatting: boolean }
): SpeechChunk[] {
    const blocks = collectReadableBlocks(doc)
    const chunks: SpeechChunk[] = []
    let nextId = 0

    for (const block of blocks) {
        const rawBlockText = String(block.textContent || "")
        if (!rawBlockText.trim()) {
            continue
        }
        const isHeading = HEADING_TAGS.has(String(block.tagName || "").toUpperCase())
        const sentences = splitIntoSentences(rawBlockText)

        sentences.forEach((span, idx) => {
            const spoken = options.cleanupFormatting
                ? cleanTextForSpeech(span.text)
                : span.text.replace(/\s+/g, " ").trim()
            if (!spoken) {
                return
            }
            chunks.push({
                id: nextId++,
                rawText: span.text,
                spokenText: spoken,
                isHeading,
                isParagraphEnd: idx === sentences.length - 1,
                blockElement: block,
                startOffset: span.start,
                endOffset: span.end
            })
        })
    }

    return chunks
}

export function clearHighlightsInDocument(doc: any): void {
    if (!doc?.querySelectorAll) {
        return
    }
    const highlights = Array.from(doc.querySelectorAll("[data-7cs-tts-highlight]")) as any[]
    for (const span of highlights) {
        const parent = span.parentNode
        if (!parent) {
            continue
        }
        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span)
        }
        parent.removeChild(span)
        if (typeof parent.normalize === "function") {
            parent.normalize()
        }
    }
}

export function highlightChunkInDocument(
    doc: any,
    chunk: SpeechChunk,
    style: HighlightStyle
): () => void {
    clearHighlightsInDocument(doc)
    if (!doc || !chunk.blockElement) {
        return () => {}
    }

    const showTextFilter = doc.defaultView?.NodeFilter?.SHOW_TEXT ?? 4
    const walker = doc.createTreeWalker(chunk.blockElement, showTextFilter)
    const textNodes: Array<{ node: any; start: number; end: number }> = []
    let cursor = 0
    let currentNode = walker.nextNode()
    while (currentNode) {
        const value = String(currentNode.nodeValue || "")
        textNodes.push({
            node: currentNode,
            start: cursor,
            end: cursor + value.length
        })
        cursor += value.length
        currentNode = walker.nextNode()
    }

    let firstHighlightSpan: any = null

    for (const entry of textNodes) {
        const overlapStart = Math.max(entry.start, chunk.startOffset)
        const overlapEnd = Math.min(entry.end, chunk.endOffset)
        if (overlapStart >= overlapEnd) {
            continue
        }

        const localStart = overlapStart - entry.start
        const localEnd = overlapEnd - entry.start
        const targetNode = entry.node
        const parent = targetNode.parentNode
        if (!parent) {
            continue
        }

        const fullValue = String(targetNode.nodeValue || "")
        const beforeText = fullValue.slice(0, localStart)
        const matchText = fullValue.slice(localStart, localEnd)
        const afterText = fullValue.slice(localEnd)

        const fragment = doc.createDocumentFragment()
        if (beforeText) {
            fragment.appendChild(doc.createTextNode(beforeText))
        }

        const span = doc.createElement("span")
        span.setAttribute("data-7cs-tts-highlight", "true")
        span.style.backgroundColor = style.background
        span.style.color = style.color
        span.style.borderRadius = "3px"
        span.style.boxShadow = `0 0 0 2px ${style.outline}`
        span.textContent = matchText
        fragment.appendChild(span)

        if (!firstHighlightSpan) {
            firstHighlightSpan = span
        }

        if (afterText) {
            fragment.appendChild(doc.createTextNode(afterText))
        }

        parent.replaceChild(fragment, targetNode)
    }

    if (firstHighlightSpan && typeof firstHighlightSpan.scrollIntoView === "function") {
        firstHighlightSpan.scrollIntoView({
            behavior: style.reducedMotion ? "auto" : "smooth",
            block: "nearest",
            inline: "nearest"
        })
    }

    return () => {
        clearHighlightsInDocument(doc)
    }
}
