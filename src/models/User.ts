import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ILog {
    _id?: string;
    amount: number;
    category: string;
    note?: string;
    createdAt: Date;
}

export interface IUserDetails {
    firebaseUid: string;
    authProvider: string;
    firstName: string;
    lastName: string;
    dob?: string;
    email: string;
}

export interface IUserSettings {
    spendLimit: number;
}

export interface IUser extends Document {
    details: IUserDetails;
    settings: IUserSettings;
    logs: ILog[];
    createdAt: Date;
    updatedAt: Date;
}

const LogSchema = new Schema<ILog>({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    note: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const UserDetailsSchema = new Schema<IUserDetails>({
    firebaseUid: { type: String, required: true, unique: true },
    authProvider: { type: String, default: "google" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: String },
    email: { type: String, required: true, unique: true },
});

const UserSettingsSchema = new Schema<IUserSettings>({
    spendLimit: { type: Number, default: 0 },
});

const UserSchema = new Schema<IUser>(
    {
        details: { type: UserDetailsSchema, required: true },
        settings: { type: UserSettingsSchema, default: () => ({}) },
        logs: { type: [LogSchema], default: [] },
    },
    { timestamps: true }
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
