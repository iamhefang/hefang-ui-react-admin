export interface OnLockChanged {
    lock: boolean
    password: string
    onResult: (lock: boolean, tips?: string) => void
}
