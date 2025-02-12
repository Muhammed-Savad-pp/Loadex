export interface userSignUp {
    name: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string
}

export interface formError {
    name?: string,
    email?: string,
    phone?: string,
    password?: string,
    confirmPassword?: string,
}