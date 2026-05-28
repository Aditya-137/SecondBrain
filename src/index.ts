import express from "express";
import jwt from "jsonwebtoken";
import {connectDB} from "./db.js";
import { ContentModel, contentType, LinkModel, UserModel } from "./models.js";
import bcrypt from "bcrypt";
import z from "zod";
import { checkTokens, type CustomRequest } from "./middleware.js";
import crypto from "crypto";

const app = express();
app.use(express.json());

await connectDB();
console.log("Server started and connected!");

const AuthReq = z.object({
    username : z.string().min(3).max(10),
    password : z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,20}$/)
})

app.post("/api/v1/signup", async (req, res) => {
    const valid = AuthReq.safeParse(req.body);
    if (valid.success){
        try {
            const pw = await bcrypt.hash(valid.data.password, 10);
            await UserModel.create({
                username : valid.data.username, 
                password : pw
            })
            return res.status(200).send("User successfully signed up!")
        }
        catch (e) {
            console.log(e);
            return res.status(403).send("User already exists!");
        }
    }
    else return res.status(400).send("Mission credentials/ Incorrect credential types")
});

app.post("/api/v1/signin", async (req, res) => {
    try{
        const valid = AuthReq.safeParse(req.body);
        if (valid.success){
            const user = await UserModel.findOne({
                username : valid.data.username
            });
            if (user && await bcrypt.compare(valid.data.password, user.password)){
                const signedUsername = jwt.sign({
                    id : user._id
                }, process.env.JWT_SECRET!);
                return res.status(200).json({
                    token : signedUsername
                });
            }
            else {
                return res.status(401).send("Invalid credentials!");
            }
        }
        else return res.status(400).send("Incomplete credentials!");
    }
    catch (e){
        console.log(e);
        return res.status(500).send("Some error occured!!!")
    }
});

const contentReq = z.object({
    link : z.string(),
    type : z.enum(contentType), 
    title : z.string(),
    tags : z.array(z.string()).default([]),
    // userId : z.string()
})

app.get("/api/v1/content", checkTokens, async (req : CustomRequest,res) => {
    try {
        const contents = await ContentModel.find({
            userId : req.userId!
        }).populate("userId", "username");
        return res.json({contents});
    }
    catch (e) {
        return res.status(500).json({
            message : "Server Error!"
        });
    }
});

app.post("/api/v1/content", checkTokens, async (req : CustomRequest,res) => {
    try {
        const validated = contentReq.safeParse(req.body);
        if (validated.success){
            await ContentModel.create({
                link : validated.data.link,
                type : validated.data.type,
                title : validated.data.title,
                tags : validated.data.tags,
                userId : req.userId!
            })
            return res.status(200).json({
                message : "Content Added succesfully!"
            })
        }
        else{
            return res.status(400).json({
                message : "Incomplete details!"
            })
        }
    }
    catch (e){
        return res.json({
            message : "And error occured! " + e
        })
    }
});

app.delete("/api/v1/content", checkTokens, async (req : CustomRequest,res) => {
    try{
        const contentId = req.body.contentId;
        if (!contentId){
            return res.status(400).json({
                message: "Provide contentId to be deleted!"
            });
        }
        const content = await ContentModel.findById(contentId);
        if (!content){
            return res.status(404).json({
                message: "Content not found!"
            });
        }
        if (!content.userId.equals(req.userId!)){
            return res.status(403).json({
                message: "Unauthorized to delete this content!"
            });
        }
        await ContentModel.deleteOne({
            _id: contentId
        });
        return res.status(200).json({
            message: "Content deleted successfully!"
        });
    }
    catch (e){
        return res.status(500).json({
            message : "And error occured! " + e
        })
    }
});

const shareable = z.object({
    share : z.boolean()
})

app.post("/api/v1/brain/share", checkTokens, async (req : CustomRequest, res) => {
    try {
        const toShare = shareable.safeParse(req.body);
        if (!toShare.success || !toShare.data.share) return res.status(400).json({
            message : "Incorrect Arguments"
        })
        const hash = crypto.randomBytes(8).toString("hex")
        await LinkModel.create({
            hash : hash,
            userId : req.userId!
        })
        return res.json({
            link : hash
        })
    }
    catch (e) {
        return res.status(500).json({
            message : "Server Error!" + e
        })
    }
});

const paramsSchema = z.object({
    shareLink: z.string().min(1)
})

app.get("/api/v1/brain/:shareLink", checkTokens, async (req : CustomRequest, res) => {
    try {
        const hash = paramsSchema.safeParse(req.params);
        if (!hash.success) return res.status(400).json({
                message : "Incorrect Arguments"
            });
        
        const link = await LinkModel.findOne({
            hash : hash.data.shareLink
        });
        if (!link){
            return res.status(404).json({
                message : "Invalid Link!"
            });
        }
        const content = await ContentModel.find({
            userId : link.userId
        });
        return res.json({
            content
        })
    }
    catch (e){
        return res.status(500).json({
            message : "Server Error!" + e
        });
    }
});

app.listen(3000);