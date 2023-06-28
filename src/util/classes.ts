export class ResponseList{
    items: any[]
    currentPage: number
    size: number
    total: number

    constructor (size: number = 10, currentPage: number = 1, total: number, items: any[] = []){
        this.items = items
        this.currentPage = currentPage;
        this.size = size;
        this.total = total
    }
}