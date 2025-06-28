class AppError {
    public statusCode: number;
    public readonly success: boolean;
    public message: string;

    constructor(message: string, statusCode: number) {
        this.statusCode = statusCode;
        this.success = false;
        this.message = message;
    }
}

export default AppError;