import { NextFunction, Request, Response } from "express";
import { User } from "@prisma/client";
import { generatePayloadFromToken } from "../helpers";
import { prisma } from "@/config/database";

type AuthenticatedUser = Omit<User, "password">;

interface RequestWithUser extends Request {
    user?: AuthenticatedUser;
}

class AuthMiddleWare {
    async check(
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (
                !req.headers.authorization ||
                !req.headers.authorization.startsWith("Bearer")
            )
                throw new Error(
                    "You need to Login first To access this route//401"
                );

            const token = req.headers.authorization.split(" ")[1];
            if (!token) throw new Error("Not authorized to access this route");

            const generatePayload = generatePayloadFromToken(token);

            const user = await prisma.user.findUnique({
                where: { id: generatePayload.id },
            });

            if (!user) {
                throw new Error("Token not found --//401");
            }

            const { password, ...publicUser } = user;
            void password;
            req.user = publicUser;

            next();
        } catch (error: any) {
            res.status(401).send({
                message: error.message,
            });
        }
    }
}

export default new AuthMiddleWare();
