class AppError {
    public statusCode: number;
    public readonly success: boolean;
    public message: string;

    constructor(message: string, statusCode: number) {
        this.statusCode = statusCode;
        this.success = false;
        this.message = message;

        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export default AppError;