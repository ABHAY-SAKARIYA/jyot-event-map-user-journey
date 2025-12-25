
"use server";

import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function readData(fileName) {
    try {
        const filePath = path.join(DATA_DIR, fileName);
        const fileContent = await fs.readFile(filePath, "utf-8");
        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        return null;
    }
}

export async function writeData(fileName, data) {
    try {
        const filePath = path.join(DATA_DIR, fileName);
        // Pretty print JSON
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
        return { success: true };
    } catch (error) {
        console.error(`Error writing ${fileName}:`, error);
        return { success: false, error: error.message };
    }
}

export async function authenticate(formData) {
    const password = formData.get("password");
    // Hardcoded password for local dev as requested
    if (password === "admin123") {
        return { success: true };
    }
    return { success: false, error: "Invalid password" };
}
