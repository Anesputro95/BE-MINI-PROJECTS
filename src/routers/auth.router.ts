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
        this.accountController = new AuthAccountController();
        this.initialRoutes();
    }

    private initialRoutes(): void {
        this.router.post("/regis", regisValidation, this.accountController.register);
        this.router.post("/login", loginValidation, this.accountController.login);

        this.router.get("/verify", this.accountController.verifyAccount);
        
        this.router.patch(
            "/profile-img/",
            uploadMemory().single("img"),
            verifyToken,
            this.accountController.uploadProfile
        );
        this.router.patch("/update", verifyToken, this.accountController.editProfile);
        this.router.post("/reset-password-request", this.accountController.requestResetPassword);
        this.router.post("/reset-password/", this.accountController.confirmResetPassword);
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default AuthAccountRouter;