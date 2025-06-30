import { Router } from "express";
import { loginValidation, regisValidation } from "../middleware/validator/auth"
import { verifyToken } from "../middleware/verifyToken";
import { verify } from "node:crypto";
import { uploadMemory } from "../middleware/uploader";
import AuthAccountController from "../controllers/auth.controller";

class AuthAccountRouter {
    private router: Router;
    private accountController: AuthAccountController;
    
    constructor() {
        this.router = Router();
        this.accountController = new AuthAccountController();;
        this.initialRoutes();
    }

    private initialRoutes(): void {
        this.router.post("/regis", regisValidation, this.accountController.register);
        this.router.post("/login", loginValidation, this.accountController.login);
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default AuthAccountRouter;