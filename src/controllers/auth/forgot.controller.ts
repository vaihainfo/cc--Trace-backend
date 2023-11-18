import { Request, Response } from "express";
import User from "../../models/user.model";
import * as crypto from "crypto";
import UserToken from "../../models/user-token.model";
import { sendForgotEmail } from "../../provider/send-mail";
import hash from "../../util/hash";

const forgotPassword = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) {
            return res.sendError(res, "ERR_AUTH_WRONG_USERNAME_OR_PASSWORD");
        }

        let resetToken = crypto.randomBytes(32).toString("hex");
        let token = await UserToken.findOne({ where: { user_id: user.id } })
        if (!token) {
            await UserToken.create({ user_id: user.id, token: resetToken, createdAt: Date.now() });
        } else {
            await UserToken.update({ token: resetToken }, {
                where: {
                    id: token.id
                }
            });
        }
        const link = `${process.env.ADMIN_URL}/auth/reset-password?token=${resetToken}`;

        sendForgotEmail(link, user.email);
        return res.send({ success: true, message: 'Forgot password email has been send' });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
};

const resetPassword = async (req: Request, res: Response) => {
    try {
        const userToken = await UserToken.findOne({ where: { token: req.body.token } });
        if (!userToken) {
            return res.sendError(res, "ERR_AUTH_WRONG_TOKEN");
        }
        await UserToken.destroy({ where: { id: userToken.id } });
        await User.update({
            password: await hash.generate(req.body.password),
        }, {
            where: {
                id: userToken.user_id
            }
        });
        return res.send({ status: true, message: 'Password changed successfully' });
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }

};

export { forgotPassword, resetPassword }
