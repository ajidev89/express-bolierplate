import dayjs from "dayjs";
import { User } from "@prisma/client";
import OtpMail from "@/mails/otp.mail";
import { prisma } from "@/config/database";
import {
    compareBcryptPassword,
    generateRandomCode,
    generateTokenFromPayload,
    stringToHash,
} from "../helpers";
import {
    LoginPayload,
    OtpPayload,
    RegisterPayload,
    VerifyOtpPayload,
} from "./interface/auth.interface";

export type PublicUser = Omit<User, "password">;

export interface AuthRepositoryInterface {
    login(request: LoginPayload): Promise<{ user: PublicUser; token: string }>;
    register(request: RegisterPayload): Promise<PublicUser>;
    sendOtp(request: OtpPayload): Promise<void>;
    verifyOtp(request: VerifyOtpPayload): Promise<void>;
    resetPassword(request: { email: string }): void;
    changePassword(request: { email: string; token: string }): void;
}

const toPublicUser = (user: User): PublicUser => {
    const { password, ...publicUser } = user;
    void password;
    return publicUser;
};

class AuthRepository implements AuthRepositoryInterface {
    private async createOtp(user: Pick<User, "id" | "email">): Promise<void> {
        const code = generateRandomCode();
        const expiredAt = dayjs().add(5, "minute").toDate();

        await prisma.otp.create({
            data: {
                userId: user.id,
                code,
                expiredAt,
            },
        });

        new OtpMail(user.email, code);
    }

    async login(
        request: LoginPayload
    ): Promise<{ user: PublicUser; token: string }> {
        const user = await prisma.user.findUnique({
            where: { email: request.email },
        });

        if (!user || !compareBcryptPassword(request.password, user.password)) {
            throw new Error("These credentails do not match any records");
        }

        return {
            user: toPublicUser(user),
            token: generateTokenFromPayload({ id: user.id }),
        };
    }

    async register(request: RegisterPayload): Promise<PublicUser> {
        const existing = await prisma.user.findUnique({
            where: { email: request.email },
        });

        if (existing) {
            throw new Error("Email already exist");
        }

        const user = await prisma.user.create({
            data: {
                firstName: request.first_name,
                lastName: request.last_name,
                email: request.email,
                password: stringToHash(request.password),
            },
        });

        await this.createOtp(user);

        return toPublicUser(user);
    }

    async sendOtp(request: OtpPayload): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { email: request.email },
        });

        if (!user) {
            throw new Error("This email do not match any records");
        }

        await this.createOtp(user);
    }

    async verifyOtp(request: VerifyOtpPayload): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { email: request.email },
        });

        if (!user) {
            throw new Error("This email do not match any records");
        }

        const otp = await prisma.otp.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });

        const isValid =
            otp &&
            dayjs(otp.expiredAt).isAfter(dayjs()) &&
            request.code === otp.code;

        if (!otp || !isValid) {
            throw new Error("Otp is expired or invaild");
        }

        await prisma.otp.update({
            where: { id: otp.id },
            data: { usedAt: new Date() },
        });

        if (!user.emailVerifiedAt) {
            await prisma.user.update({
                where: { id: user.id },
                data: { emailVerifiedAt: new Date() },
            });
        }
    }

    async resetPassword(request: { email: string }) {}
    async changePassword(request: { email: string; token: string }) {}
}

export default new AuthRepository();
