import mongoose, { Schema, model, Types } from "mongoose";

export const contentType = ["image", "audio", "video", "article"];

interface IUser {
    username: string;
    password: string;
}

const UserSchema = new Schema<IUser>({
    username : {type : String, required : true, unique : true},
    password : {type : String, required : true, },
});

export const UserModel = model<IUser>('User', UserSchema);

interface ITag {
    title : string;
}

const TagSchema = new Schema<ITag>({
    title : {type : String, required : true, unique : true},
});

export const TagModel = model<ITag>('Tag', TagSchema);

interface IContent {
    link: string;
    type: string;
    title: string;
    tags: Types.ObjectId[];
    userId: Types.ObjectId;
}

const ContentSchema = new Schema<IContent>({
    link    : {type : String, required : true},
    type    : {type : String, enum : contentType, required : true},
    title   : {type : String, required : true},
    tags    : [{type : Types.ObjectId, ref : 'Tag'}],
    userId  : {type : Types.ObjectId, ref : 'User', required : true},
});

export const ContentModel = model<IContent>('Content', ContentSchema);

interface ILink {
    hash: string;
    userId: Types.ObjectId;
}

const LinkSchema = new Schema<ILink>({
    hash : {type: String, required : true, unique: true},
    userId : {type : Types.ObjectId, ref : 'User', required : true},
})

export const LinkModel = model<ILink>('Link', LinkSchema);