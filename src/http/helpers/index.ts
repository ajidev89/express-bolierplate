import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const stringToHash = (string: string): string => {
    const saltRounds = 10;
    const hashedString = bcrypt.hashSync(string, saltRounds);
    return hashedString;
};

export const generatePayloadFromToken = (token: string): { id: string } => {
    const salt = process.env.TOKEN_SECRET || "inCaseEnvNoDey";
    const payload = jwt.verify(token, salt) as { id: string };
    return payload;
};

export const compareBcryptPassword = (
    suppliedPassword: string,
    storedPassword: string
): boolean => {
    return bcrypt.compareSync(suppliedPassword, storedPassword);
};

export const generateTokenFromPayload = (payload: any): string => {
    const salt = process.env.TOKEN_SECRET || "inCaseEnvNoDey";
    const token: string = jwt.sign(payload, salt, {
        expiresIn: process.env.TOKEN_DURATION ?? "30m",
    });
    return token;
};

export const generateRandomCode = (): string => {
    return Math.floor(100000 + Math.random() * 9000).toString(); // generate a random 6-digit code
};
