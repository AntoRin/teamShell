import { Document } from "mongoose";

export interface DriveFileDoc extends Document {
    creator: string;
    project: string;
    name: string;
    id: string;
    description: string;
    mimeType: string;
    iconLink: string;
    thumbnailLink: string;
    webContentLink: string;
    webViewLink: string;
    createdTime: Date;
}