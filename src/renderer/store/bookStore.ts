import { defineStore } from "pinia"

export const useBookStore = defineStore("bookStore", {
    state: () => ({
        pageNumber: 0,
        bookName: "",
        lastOpenedBook: "",
        books: []
    }),
    getters: {
        getCounter: (state): number => state.pageNumber,
        getBookName: (state): string => state.bookName,
        getBooks: (state): string[] => state.books,
        getLastOpenedBook: (state): string => state.lastOpenedBook
    },
    actions: {
        counterIncrease(amount: number) {
            this.pageNumber += amount
        },
        setBookName(name: string) {
            this.bookName = name
        },
        setLastOpenedBook(name: string) {
            this.lastOpenedBook = name
        }
    }
})
