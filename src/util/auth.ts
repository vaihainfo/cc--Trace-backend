import jwt from "jsonwebtoken";
import conf from "../conf/auth.conf";

// export async function checkAccessToken(accessToken: string) {
//   try {
//     var r: any = await jwt.verify(accessToken, conf.secret);
//     return { data: r, error: null };
//   } catch (error) {
//     return { data: null, error };
//   }
// }

export async function checkAccessToken(accessToken: string) {
  try {
    // Try to verify with the first secret
    const data = await jwt.verify(accessToken, conf.secret);
    return { data, error: null };
  } catch (error: any) {
    if (error?.name === 'JsonWebTokenError') {
      // If the first secret fails, try the second one
      try {
        let data: any= {};
         data.user = await jwt.verify(accessToken, conf.mobilesecret);
        return { data, error: null };
      } catch (error) {
        // Return an error if both secrets fail
        return { data: null, error };
      }
    } else {
      // Return any other errors (not JWT-related)
      return { data: null, error };
    }
  }
}

export async function generateTokens(_id: string, role: string) {
  var r = await jwt.sign({ user: { _id, role } }, conf.secret, {
    expiresIn: conf.expiresIn,
  });
  return { accessToken: r };
}
