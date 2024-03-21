import bcrypt from "bcryptjs";
import conf from "../conf/hash.conf";

export default {
  /**
   *
   * @param hashedPassword Hashed Password from the database
   * @param plainPassword Plain Password sent by the client
   *
   * @returns {Boolean}
   */
  compare: async (plainPassword: string, hashedPassword: string) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },
  /**
   *
   * @param plainPassword
   */
  generate: async (plainPassword: string) => {
    return await bcrypt.hash(plainPassword, conf.saltRounds);
  },
};