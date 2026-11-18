// import { Flask, Request, Response } from 'flask';
// import { Api, Resource, reqparse } from 'flask-restful';
// import { get_soup_from_internet, get_books } from './scrapper';

// const app = Flask(__name__);
// const api = Api(app);

// const contents = [
//     "Journal article", "Book (any)", "Book (non-fiction)",
//     "Book (fiction)", "Book (unknown)", "Comic book", "Magazine",
//     "Standards document"
// ];

// const langs = [
//     'en', 'ru', 'de', 'es', 'fr', 'it',
//     'uk', 'pt', 'nl', 'el', 'zh', 'hu',
//     'ro', 'pl', 'tr', 'la', 'kk', 'be',
//     'lt', 'ba', 'ar', 'cs', 'ja', 'sv',
//     'ca', 'lv', 'sr', 'id', 'hi', 'da',
//     'uz', 'af', 'no', 'tt', 'tk', 'ka',
//     'hr', 'mn', 'si', 'ko', 'he', 'grc',
//     'taj', 'tar', 'nl-BE', 'sve', 'sk',
//     'ps', 'bg', 'ky', 'fa', 'mr', 'az',
//     'eo', 'sq', 'sm', 'ml', 'gl', 'ndl',
//     'ug', 'gu', 'sl', 'fil', 'qu', 'hy',
//     'so', 'bs', 'et', 'sce', 'ur', 'bn',
//     'ta', 'vi', 'fi', 'th', 'ku', 'sa',
//     'te', 'ne', 'sh', 'is', 'eu', 'my',
//     'tl', 'ms', 'yi', 'sw', 'pa', 'mk',
//     'ht', 'bo', 'kn', 'lo'
// ];

// const exts = [
//     'pdf', 'epub', 'djvu', 'cbr', 'mobi', 'doc', 'cbz', 'azw3', 'rar',
//     'fb2', 'rtf', 'zip', 'lit', 'txt', 'docx', 'htm', 'html', 'lrf',
//     'fb2.zip', 'mht'
// ];

// const sorts = ['newest', 'oldest', 'largest', 'smallest'];

// class BookSpecific extends Resource {
//     async get(req: Request, res: Response) {
//         const parser = reqparse.RequestParser();
//         parser.add_argument("lang", type=str, required=False, location="args");
//         parser.add_argument("content", type=str, required=False, location="args");
//         parser.add_argument("ext", type=str, required=False, location="args");
//         parser.add_argument("sort", type=str, required=False, location="args");
//         parser.add_argument("author", type=str, required=False, location="args");
//         parser.add_argument("title", type=str, required=False, location="args");
//         const args = parser.parse_args();

//         if (args["title"] === undefined && args["author"] === undefined) {
//             return res.status(400).json({
//                 "message": "no title or author was given",
//                 "help": "pass a title of a book or the name of a author, or both"
//             });
//         }

//         if (args["lang"] !== undefined && !langs.includes(args["lang"])) {
//             return res.status(400).json({
//                 "message": "the parameter used for lang is not correct",
//                 "lang": args["lang"],
//                 "help": "the correct values are the following: ",
//                 "options": langs
//             });
//         }

//         if (args["content"] !== undefined && !contents.includes(args["content"])) {
//             return res.status(400).json({
//                 "message": "the parameter used for content is not correct",
//                 "content": args["content"],
//                 "help": "the correct values are the following: ",
//                 "options": contents
//             });
//         }

//         if (args["
