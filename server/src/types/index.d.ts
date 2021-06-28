import { Request } from "express";
import { Socket } from "socket.io";
import { userNotification } from "../interfaces/IUser";

export type reqUser = {
   UniqueUsername: string;
   Email: string;
};

export interface INamedRequest extends Request {
   thisUser?: reqUser;
   notifications?: Array<userNotification>;
}

export interface INamedSocket extends Socket {
   userName?: string;
   authToken?: string;
}

export type tokenPayload = {
   UniqueUsername: string;
   Email: string;
};

export type messagesType = {
   from: string;
   to?: string;
   content: string;
   messageType?: string;
   time?: Date;
};
