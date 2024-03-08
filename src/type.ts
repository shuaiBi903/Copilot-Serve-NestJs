export type SendMessage = {
    stream: boolean
    model: "gpt-4" | "gpt-3.5-turbo"
    messages: any[]
    temperature?: number,
    topP?: number,
    n?: number,
    [key: string]: any
}