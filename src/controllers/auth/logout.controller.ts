import { Request, Response } from "express";

const logout = async (req: Request, res: Response) => {
  res.sendSuccess(res, {});
};

export default logout;