export function validatePassword(prop_password: string) {
    const password = prop_password.trim();

    return {
        length: password.length > 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSymbol: /[^A-Za-z0-9]/.test(password),
        hasSpace: password.includes(" "),
    }
}

export function passwordsMatch(password1: string, password2: string) {
    return password1.trim() === password2.trim()
}