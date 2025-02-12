export interface FormError {
    name?: string,
    email?: string,
    phone?: string,
    password?: string,
    confirmPassword?: string,
}


export const validateField = (name: string, value: string, isLogin: boolean = false): string | undefined => {
    switch(name) {
        case "name": 
            if(!isLogin){
                if(!value.trim()) return 'Full name is required';
            }
            break;
        
        case "email":
            const  emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if(!value.trim()) return 'Email address is required';
            if(!emailRegex.test(value)) return 'Invalid email address format';
            break;
        case "phone":
            if(!isLogin){
                const phoneRegex = /^\d{10}$/;
                if(!value.trim()) return 'Phone number is required';
                if(!phoneRegex.test(value)) return 'Phone number must be 10 digits';
            }
            break;
        case "password":
            if(!value.trim()) return 'Password is required';
            if(value.length < 8) return 'Password must be at least 8 characters';
            if(!/^(?=.*\d).{8,}$/.test(value)) return 'Password must contain at least one number';
            break;
        case "confirmPassword": 
            if(!isLogin){
                if(!value.trim()) return 'confirm Password is required';
            }
            break;
    }
    return undefined
}

export const validateForm = (formData: any, mode:string) => {

    const isLogin = mode === "login";
    const errors: FormError = {} 
    
    const fieldValidations = isLogin ? 
    ["email", "password"] : 
    ["name", "email", "phone", "password", "confirmPassword"];


    fieldValidations.forEach(field => {
        const error = validateField(field, formData[field], isLogin);
        if(error) errors[field as keyof FormError] = error;
    });

    if(!isLogin && formData.password !== formData.confirmPassword){
        errors.confirmPassword = "Password do not match";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };

}