"use server"
import { revalidateTag } from "next/cache";

export default async function revalidateProfile() {
    revalidateTag("profile");
}