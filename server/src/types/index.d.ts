import { Request } from "express";
import { Socket } from "socket.io";
import { UserNotificationType } from "../interfaces/UserModel";

export interface AuthenticatedRequest extends Request {
   thisUser?: RequestUserType;
   notifications?: Array<UserNotificationType>;
}

export interface UserContextSocket extends Socket {
   userName?: string;
   authToken?: string;
}

export interface MessagesType {
   from: string;
   to?: string;
   content: string;
   messageType?: string;
   time?: Date;
}

export type RequestUserType = {
   UniqueUsername: string;
   Email: string;
};

export type TokenPayloadType = {
   UniqueUsername: string;
   Email: string;
};
