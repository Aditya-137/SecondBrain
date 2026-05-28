import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface CustomRequest extends Request {
    userId?: string
}

interface JwtPayload {
    id: string
}

export function checkTokens(req : CustomRequest, res : Response, next : NextFunction){
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const verify = jwt.verify(
            token!,
            process.env.JWT_SECRET!
        ) as JwtPayload;
        req.userId = verify.id;
        next();
    }
    catch (err){
        return res.status(401).json({
            message : "Unauthorized!"
        });
    }
}