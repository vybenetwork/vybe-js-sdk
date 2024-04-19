import { Buffer } from 'buffer'
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js'
import {
    CREDITS_PRICE_USDC,
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    VYBE_USDC_TOKEN_ACCOUNT
} from './constants'

export function getSPLTokenAccount(sender: PublicKey, mint: PublicKey): PublicKey {
    const senderTokenAddress = PublicKey.findProgramAddressSync([
      sender.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.toBuffer()
    ], SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID)

    return senderTokenAddress[0]
}

export function createCreditPurchaseInstruction(sender: PublicKey, senderTokenAccount: PublicKey) {
    // Instruction data: 1-byte instruction type + 8-byte amount
    const data = Buffer.alloc(9)
    data[0] = 3
    data.writeUInt32LE(CREDITS_PRICE_USDC & 0xffffffff, 1); // Write lower 32 bits
    data.writeUInt32LE((CREDITS_PRICE_USDC / 0x100000000) | 0, 5); // Write upper 32 bits

    const transferInstruction = new TransactionInstruction({
        programId: TOKEN_PROGRAM_ID,
        keys: [
            { pubkey: senderTokenAccount, isSigner: false, isWritable: true },
            { pubkey: VYBE_USDC_TOKEN_ACCOUNT, isSigner: false, isWritable: true },
            { pubkey: sender, isSigner: true, isWritable: false },
        ],
        data
    })

    return transferInstruction
}

export async function checkTokenBalance(senderTokenAccount: PublicKey, amount: number, connection: Connection): Promise<boolean> {
    try {
        // Fetch the token account balance
        const accountInfo = await connection.getAccountInfo(senderTokenAccount);
        if (!accountInfo) {
            console.error('Failed to find the token account');
            return false;
        }

        // Parse the account data to get the token balance
        const data = accountInfo.data;
        const balance = data.readUInt32LE(64); // Token amount is usually stored at offset 64 in the account data

        // Check if the balance is sufficient
        return balance >= amount;
    } catch (error) {
        console.error('[VybeSDK] Error checking token balance:', error);
        return false;
    }
}

