import { NextRequest, NextResponse } from "next/server";
import Arweave from "arweave";

// You'll need to define your wallet - either import from a secure location or load from environment
// Example: const wallet = JSON.parse(process.env.ARWEAVE_WALLET_KEY || '{}');
// For security, never hardcode wallet keys in your source code
const wallet = JSON.parse(process.env.ARWEAVE_WALLET_KEY || "{}");

// POST handler for file upload
export async function POST(req: NextRequest) {
  // Initialize Arweave with network configuration
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  });

  try {
    // Get form data from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("File uploaded:", file.name);

    // Check if wallet is properly configured
    if (!wallet || Object.keys(wallet).length === 0) {
      throw new Error("Arweave wallet not configured. Please set ARWEAVE_WALLET_KEY environment variable.");
    }

    // Check wallet balance first
    const address = await arweave.wallets.jwkToAddress(wallet);
    const balance = await arweave.wallets.getBalance(address);
    console.log("Wallet balance:", arweave.ar.winstonToAr(balance), "AR");

    if (balance === "0") {
      throw new Error("Insufficient wallet balance. You need AR tokens to upload files.");
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    console.log("File size:", fileBuffer.length, "bytes");

    // Create Arweave transaction with proper encoding
    const transaction = await arweave.createTransaction(
      {
        data: fileBuffer,
      },
      wallet,
    );

    // Add tags to the transaction
    transaction.addTag("Content-Type", file.type);
    transaction.addTag("File-Name", file.name);
    transaction.addTag("App-Name", "ArweaveUploader");
    transaction.addTag("App-Version", "1.0.0");

    // Calculate and log transaction fee
    const cost = await arweave.transactions.getPrice(fileBuffer.length);
    console.log("Transaction cost:", arweave.ar.winstonToAr(cost), "AR");

    // Sign the transaction
    await arweave.transactions.sign(transaction, wallet);
    console.log("Transaction signed. ID:", transaction.id);

    // Verify transaction before posting
    const isValid = await arweave.transactions.verify(transaction);
    if (!isValid) {
      throw new Error("Transaction verification failed");
    }
    console.log("Transaction verified successfully");

    // Post the transaction
    console.log("Posting transaction to Arweave...");
    const response = await arweave.transactions.post(transaction);
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

    if (response.status === 200 || response.status === 208) {
      return NextResponse.json({
        success: true,
        transactionId: transaction.id,
        arweaveUrl: `https://arweave.net/${transaction.id}`,
        cost: arweave.ar.winstonToAr(cost) + " AR",
        message: "File uploaded to Arweave successfully!",
      });
    } else {
      // Log the full response for debugging
      console.error("Full response:", response);
      throw new Error(`Transaction failed with status: ${response.status}. ${response.data || ""}`);
    }
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}
