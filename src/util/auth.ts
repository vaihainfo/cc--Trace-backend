import jwt from "jsonwebtoken";
import conf from "../conf/auth.conf";

export async function checkAccessToken(accessToken: string) {
  try {
    var r: any = await jwt.verify(accessToken, conf.secret);
    return { data: r, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function generateTokens(_id: string, role: string) {
  var r = await jwt.sign({ user: { _id, role } }, conf.secret, {
    expiresIn: conf.expiresIn,
  });
  return { accessToken: r };
}
