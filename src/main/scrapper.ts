import * as fs from "fs"
import * as path from "path"
import * as axios from "axios"
import * as cheerio from "cheerio"

export function getSoupFromFile(file: string): CheerioStatic {
    // import the html file located in the data/ folder and asign it the name page
    const page: string = fs.readFileSync(path.join(__dirname, "..", "data", file), "utf-8")

    // parse the html using beautiful soup and store in variable `soup`
    const soup: CheerioStatic = cheerio.load(page)

    return soup
}

export function getSoupFromInternet(url: string): Promise<CheerioStatic | null> {
    if (!url.includes("https://annas-archive")) {
        return Promise.resolve(null)
    }

    return new Promise<CheerioStatic | null>((resolve, reject) => {
        axios(url, (error, response, body) => {
            if (error) {
                reject(error)
            } else {
                if (body.length === 0) {
                    resolve(null)
                } else {
                    const soup: CheerioStatic = cheerio.load(body)
                    resolve(soup)
                }
            }
        })
    })
}

export function getBooks(page: CheerioStatic): Promise<{ [key: string]: any }> {
    if (page.html() === null) {
        return Promise.resolve({ message: "Not valid url" })
    }

    const a: CheerioElement[] = page('[id^="link-index-"]')

    if (a.length === 0) {
        return Promise.resolve({ message: "No books found" })
    }

    const result: { [key: string]: any } = {}

    const rango: number = Math.min(a.length, 51)

    for (let i = 0; i < rango; i++) {
        try {
            const title: string = page(a[i]).find("h3").text()
            const authors: string = page(a[i]).find('[class="truncate italic"]').text()
            const href: string = page(a[i]).find("a").attr("href")

            const image: string | null = page(a[i]).find("img").attr("src") || null

            const complete: string[] = page(a[i])
                .find('[class="truncate text-xs text-gray-500"]')
                .text()
                .split(",")
                .map((item: string) => item.trim())

            const lang: string = complete[0] || "Unknown"
            const format: string = complete[1] || "Unknown"
            const size: string = complete[2] || "Unknown"

            const index: string = String(i)

            const resultPiece: { [key: string]: any } = {
                title,
                authors,
                lang,
                image,
                format,
                size,
                href
            }

            result[index] = resultPiece
        } catch {
            const comment: string = page(a[i]).text()
            const soupComment: CheerioStatic = cheerio.load(comment)

            const title: string = soupComment("h3").text()
            const authors: string = soupComment('[class="truncate italic"]').text()
            const href: string = soupComment("a").attr("href")

            const image: string | null = soupComment("img").attr("src") || null

            const complete: string[] = soupComment('[class="truncate text-xs text-gray-500"]')
                .text()
                .split(",")
                .map((item: string) => item.trim())

            const lang: string = complete[0] || "Unknown"
            const format: string = complete[1] || "Unknown"
            const size: string = complete[2] || "Unknown"

            const index: string = String(i)

            const resultPiece: { [key: string]: any } = {
                title,
                authors,
                lang,
                image,
                format,
                size,
                href
            }

            result[index] = resultPiece
        }
    }

    return Promise.resolve(result)
}

export function isComment(text: string): boolean {
    return text.startsWith("<!--") && text.endsWith("-->")
}
