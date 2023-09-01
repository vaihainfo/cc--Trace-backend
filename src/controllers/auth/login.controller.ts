import { Request, Response } from "express";

import User from "../../models/user.model";
import { generateTokens } from "../../util/auth";
import hash from "../../util/hash";

const login = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) {
      return res.sendError(res, "ERR_AUTH_WRONG_USERNAME");
    }
    if (user) {
      let verifyPassword = await hash.compare(req.body.password, user.dataValues.password)
      if (!verifyPassword) { return res.sendError(res, "ERR_AUTH_WRONG_PASSWORD"); };

      var { accessToken } = await generateTokens(user.dataValues.id, user.dataValues.role);
      res.sendSuccess(res, { accessToken, user, isAgreementAgreed: user.isAgreementAgreed });
    }
  } catch (error) {
    console.log(error)
    return res.sendError(res, "ERR_AUTH_WRONG_USERNAME_OR_PASSWORD");
  }
}

export default login;