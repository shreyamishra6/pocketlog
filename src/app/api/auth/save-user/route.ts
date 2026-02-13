import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, displayName, uid, photoURL } = body;

        if (!email || !uid) {
            return NextResponse.json({ error: "Email and UID are required" }, { status: 400 });
        }

        await connectToDatabase();

        // Split displayName into firstName and lastName
        const nameParts = displayName ? displayName.split(" ") : ["User", ""];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || " ";

        const user = await User.findOneAndUpdate(
            { "details.firebaseUid": uid },
            {
                $set: {
                    "details.email": email,
                    "details.firebaseUid": uid,
                    "details.firstName": firstName,
                    "details.lastName": lastName,
                    "details.authProvider": "google",
                },
                // Only set these if the document is being created (upsert)
                $setOnInsert: {
                    settings: { spendLimit: 5000 }, // Default spend limit as per user example
                    logs: [],
                }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Error saving user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
