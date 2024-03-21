import { Request, Response } from "express";
import bcrypt from 'bcrypt';

import User from "../../models/user.model";
import { generateTokens } from "../../util/auth";
import hash from "../../util/hash";

const register = async (req: Request, res: Response) =>{   
        const USER_MODEL = {
          username: req.body.username,
          email: req.body.email,
          password: await hash.generate(req.body.password),
          firstname: req.body.firstName || "",
          lastname: req.body.lastName || "",
          mobile: req.body.mobile || "",
          position: req.body.position || "",
          countries_web: req.body.countriesWeb || null,
          // countries_web: [1],

          farm_group: req.body.farmGroups || null,
          access_level: req.body.accessLevel || null,
          role: req.body.role !== undefined ? Number(req.body.role) : null,
          status: req.body.status || true,
          country_id: req.body.country || null,
          state_id: req.body.state || null,
          district_id: req.body.districtsId || null,
          block_id: req.body.blocksId || null,
          village_id: req.body.villagesId || null,
          brand_mapped: req.body.brandsId || null,
          ticketApproveAccess: req.body.ticketApproveAccess || null,
          ticketCountryAccess: req.body.ticketCountryAccess || null,
          ticketAccessOnly: req.body.ticketAccessOnly || null,
          isManagementUser: req.body.isManagementUser ? true : false,
          isAgreementAgreed: false,
        };
    console.log(USER_MODEL)
        try {
          const user = await User.create(USER_MODEL);
          var { accessToken } = await generateTokens(user.dataValues.id, user.dataValues.role);
          return res.sendSuccess(res, { accessToken }, 200);
        } catch (error) {
          console.log(error)
          res.sendError(res, "ERR_AUTH_USERNAME_OR_EMAIL_ALREADY_EXIST");
        }
}

export default register;