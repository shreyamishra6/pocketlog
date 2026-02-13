import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

// GET: Fetch user logs and spend limit
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const uid = searchParams.get("uid");

        if (!uid) {
            return NextResponse.json({ error: "Firebase UID is required" }, { status: 400 });
        }

        await connectToDatabase();
        const user = await User.findOne({ "details.firebaseUid": uid });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            logs: user.logs || [],
            spendLimit: user.settings?.spendLimit || 0
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Add a new log
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { uid, amount, category, note } = body;

        if (!uid || !amount || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();
        const user = await User.findOneAndUpdate(
            { "details.firebaseUid": uid },
            {
                $push: {
                    logs: {
                        amount,
                        category,
                        note,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        console.error("Error adding log:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
