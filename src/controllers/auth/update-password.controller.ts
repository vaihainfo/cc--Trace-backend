import { Request, Response } from "express";
import User from "../../models/user.model";
import hash from "../../util/hash";

const updatePassword = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne({ where: { id: req.body.id } });
       if (!user) {
            return res.sendError(res, "ERR_AUTH_WRONG_USERNAME");
        }
        let verifyPassword = await hash.compare(req.body.oldPassword, user.password);
        if (!verifyPassword) { return res.sendError(res, "ERR_AUTH_WRONG_OLD_PASSWORD"); };

        if(verifyPassword){
        await User.update({
            password: await hash.generate(req.body.newPassword),
        }, {
            where: {
                id: req.body.id
            }
        });
        return res.send({ status: true, message: 'Password changed successfully' });
    }
    } catch (error) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }

};

export default updatePassword;