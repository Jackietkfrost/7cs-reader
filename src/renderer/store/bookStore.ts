import { defineStore } from "pinia"

export const useBookStore = defineStore("bookStore", {
    state: () => ({
        pageNumber: 0,
        bookName: ""
    }),
    getters: {
        getCounter: (state): number => state.pageNumber,
        getBookName: (state): string => state.bookName
    },
    actions: {
        counterIncrease(amount: number) {
            this.pageNumber += amount
        },
        setBookName(name: string) {
            this.bookName = name
        }
    }
})
