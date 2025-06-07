import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class ValidationService {
    checkInvalidChars(input: string):boolean {
        const regex = /[<>]/;
        return regex.test(input);
    }

    checkUsername(input: string):boolean {
        const regex = /^[a-zA-Z0-9]{3,}/;
        return regex.test(input);
    }

    checkPassword(input: string):boolean {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return regex.test(input);
    }
    doPasswordsMatch(password: string, confirmPassword: string):boolean {
        return password === confirmPassword;
    }
}