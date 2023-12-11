import { createHash } from "crypto";
import { readFileSync, readdirSync, createReadStream } from "fs";
import path, { join } from "path";
import unzipper from "unzipper";
import { fileURLToPath } from "url";

async function calculateHash(filePath) {
    const fileData = readFileSync(filePath);
    const hash = createHash("sha3-256").update(fileData).digest("hex");
    return hash;
}

async function extractFilesFromZip(zipPath, extractionPath) {
    try {
        const zipStream = createReadStream(zipPath).pipe(
            unzipper.Extract({ path: extractionPath })
        );
        await new Promise((resolve, reject) => {
            zipStream.on("close", resolve);
            zipStream.on("error", reject);
        });
    } catch (error) {
        console.error("Error extracting files from ZIP:", error.message);
    }
}

async function main() {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const zipPath = join(scriptDir, "task2.zip");

    const extractionPath = join(scriptDir, "extracted_files");
    await extractFilesFromZip(zipPath, extractionPath);

    const fileNames = readdirSync(extractionPath);

    const hashes = await Promise.all(
        fileNames.map(async (fileName) => {
            const filePath = join(extractionPath, fileName);
            return calculateHash(filePath);
        })
    );

    const sortedHashes = hashes.sort();
    const concatenatedHashes = sortedHashes.join("");
    const email = "emil.koshkelyan2001@gmail.com";
    const resultString = concatenatedHashes + email;

    const finalHash = createHash("sha3-256").update(resultString).digest("hex");

    console.log(finalHash)
}

main();
