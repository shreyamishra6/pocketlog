import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

type Params = {
    params: {
        id: string;
    };
};

// PATCH: Update a log
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();
        const { uid, amount, category, note } = body;

        if (!uid || !id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findOneAndUpdate(
            { "details.firebaseUid": uid, "logs._id": id },
            {
                $set: {
                    "logs.$.amount": amount,
                    "logs.$.category": category,
                    "logs.$.note": note,
                }
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: "Log or User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Error updating log:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove a log
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { searchParams } = new URL(req.url);
        const uid = searchParams.get("uid");

        if (!uid || !id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const user = await User.findOneAndUpdate(
            { "details.firebaseUid": uid },
            {
                $pull: { logs: { _id: id } }
            },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Log deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting log:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
