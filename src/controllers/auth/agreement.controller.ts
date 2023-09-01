import { Request, Response } from "express";

import User from "../../models/user.model";

const userAgreement = async (req: Request, res: Response) =>{
    try {

        const agreement = await User.update({isAgreementAgreed: req.body.isAgreed},{
            where: {
              id: req.body.id
            }
          });
          console.log('User find', agreement.isAgreementAgreed);
          res.sendSuccess(res, { agreement });

      } catch (error) {
        console.log(error)
        return res.sendError(res, "ERR_AUTH_WRONG_USERNAME_OR_PASSWORD");
      }
}

export default userAgreement;