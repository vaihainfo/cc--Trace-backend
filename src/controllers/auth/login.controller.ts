import { Request, Response } from "express";

import User from "../../models/user.model";
import { generateTokens } from "../../util/auth";
import hash from "../../util/hash";
import Spinner from "../../models/spinner.model";
import Ginner from "../../models/ginner.model";
import Weaver from "../../models/weaver.model";
import Knitter from "../../models/knitter.model";
import Garment from "../../models/garment.model";
import Trader from "../../models/trader.model";
import Fabric from "../../models/fabric.model";
import { Op } from "sequelize";
import Brand from "../../models/brand.model";

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
      let [spinner, ginner, weaver, knitter, garment, trader, fabric, brand] = await Promise.all([
        Spinner.findOne({ where: { spinnerUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        Ginner.findOne({ where: { ginnerUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        Weaver.findOne({ where: { weaverUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        Knitter.findOne({ where: { knitterUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        Garment.findOne({ where: { garmentUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        Trader.findOne({ where: { traderUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        Fabric.findOne({ where: { fabricUser_id: { [Op.contains]: [user.dataValues.id] } } }),
        Brand.findOne({ where: { brandUser_id: { [Op.contains]: [user.dataValues.id] } } })
      ])
      res.sendSuccess(res, {
        accessToken, user, isAgreementAgreed: user.isAgreementAgreed,
        processor: spinner ? spinner : ginner ? ginner : weaver ? weaver : knitter ? knitter : garment ? garment : fabric ? fabric : brand ? brand : trader
      });
    }
  } catch (error) {
    console.log(error)
    return res.sendError(res, "ERR_AUTH_WRONG_USERNAME_OR_PASSWORD");
  }
}

export default login;