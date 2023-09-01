import login from "./login.controller";
import register from "./register.controller";
import { forgotPassword, resetPassword } from "./forgot.controller";
import userAgreement from "./agreement.controller";
import updatePassword from "./update-password.controller";
import logout from './logout.controller';

export default {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  userAgreement,
  updatePassword
};