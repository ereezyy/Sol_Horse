// Enhanced Solana blockchain integration service
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

interface SolanaConfig {
  network: 'mainnet-beta' | 'devnet' | 'testnet';
  rpcUrl: string;
  programId: string;
}

interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
  properties: {
    files: Array<{ uri: string; type: string }>;
    category: string;
  };
}

interface HorseNFTData {
  id: string;
  genetics: any;
  stats: any;
  breeding: any;
  owner: string;
}

class SolanaService {
  private connection: Connection;
  private config: SolanaConfig;

  constructor(config: SolanaConfig) {
    this.config = config;
    this.connection = new Connection(config.rpcUrl, 'confirmed');
  }

  // Initialize connection and verify network
  async initialize(): Promise<boolean> {
    try {
      const version = await this.connection.getVersion();
      console.log('Connected to Solana network:', version);
      return true;
    } catch (error) {
      console.error('Failed to connect to Solana:', error);
      return false;
    }
  }

  // Get wallet balance in SOL
  async getWalletBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return 0;
    }
  }

  // Get SPL token balance ($TURF)
  async getTokenBalance(walletAddress: PublicKey, mintAddress: PublicKey): Promise<number> {
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletAddress,
        { mint: mintAddress }
      );

      if (tokenAccounts.value.length === 0) return 0;

      const tokenAccount = tokenAccounts.value[0];
      const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
      return balance || 0;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }
  }

  // Mint new horse NFT
  async mintHorseNFT(
    walletPublicKey: PublicKey,
    horseData: HorseNFTData,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    try {
      // Create NFT metadata
      const metadata = this.createHorseMetadata(horseData);
      
      // Upload metadata to IPFS (in production)
      const metadataUri = await this.uploadMetadata(metadata);
      
      // Create mint transaction
      const transaction = new Transaction();
      
      // Add instructions for NFT minting
      // This would include Metaplex instructions in a real implementation
      const mintInstruction = SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: new PublicKey(this.config.programId),
        lamports: 1000000 // 0.001 SOL minting fee
      });
      
      transaction.add(mintInstruction);
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPublicKey;
      
      // Sign and send transaction
      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      
      // Confirm transaction
      await this.connection.confirmTransaction(signature);
      
      return signature;
    } catch (error) {
      console.error('Error minting horse NFT:', error);
      return null;
    }
  }

  // Transfer horse NFT
  async transferHorseNFT(
    fromWallet: PublicKey,
    toWallet: PublicKey,
    nftMint: PublicKey,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    try {
      const transaction = new Transaction();
      
      // Get associated token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(nftMint, fromWallet);
      const toTokenAccount = await getAssociatedTokenAddress(nftMint, toWallet);
      
      // Check if destination token account exists
      const toAccountInfo = await this.connection.getAccountInfo(toTokenAccount);
      if (!toAccountInfo) {
        // Create associated token account
        const createAccountInstruction = createAssociatedTokenAccountInstruction(
          fromWallet,
          toTokenAccount,
          toWallet,
          nftMint
        );
        transaction.add(createAccountInstruction);
      }
      
      // Add transfer instruction (would use actual SPL token transfer in production)
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: fromWallet,
        toPubkey: toWallet,
        lamports: 1000 // Minimal transfer for demo
      });
      
      transaction.add(transferInstruction);
      
      // Set transaction properties
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromWallet;
      
      // Sign and send
      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error transferring NFT:', error);
      return null;
    }
  }

  // Create marketplace listing
  async createMarketplaceListing(
    sellerWallet: PublicKey,
    nftMint: PublicKey,
    priceInSOL: number,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    try {
      const transaction = new Transaction();
      
      // Create escrow account and listing (simplified for demo)
      const listingInstruction = SystemProgram.transfer({
        fromPubkey: sellerWallet,
        toPubkey: new PublicKey(this.config.programId),
        lamports: 5000 // Listing fee
      });
      
      transaction.add(listingInstruction);
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sellerWallet;
      
      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error creating marketplace listing:', error);
      return null;
    }
  }

  // Purchase from marketplace
  async purchaseFromMarketplace(
    buyerWallet: PublicKey,
    sellerWallet: PublicKey,
    nftMint: PublicKey,
    priceInSOL: number,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    try {
      const transaction = new Transaction();
      
      // Transfer SOL to seller
      const paymentInstruction = SystemProgram.transfer({
        fromPubkey: buyerWallet,
        toPubkey: sellerWallet,
        lamports: priceInSOL * LAMPORTS_PER_SOL
      });
      
      transaction.add(paymentInstruction);
      
      // Transfer NFT to buyer (simplified)
      const nftTransferInstruction = SystemProgram.transfer({
        fromPubkey: buyerWallet,
        toPubkey: new PublicKey(this.config.programId),
        lamports: 1000 // Processing fee
      });
      
      transaction.add(nftTransferInstruction);
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = buyerWallet;
      
      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error purchasing from marketplace:', error);
      return null;
    }
  }

  // Get NFTs owned by wallet
  async getWalletNFTs(walletAddress: PublicKey): Promise<any[]> {
    try {
      // In production, this would query the actual NFT program accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletAddress,
        { programId: TOKEN_PROGRAM_ID }
      );

      // Filter for NFTs (amount = 1, decimals = 0)
      const nftAccounts = tokenAccounts.value.filter(account => {
        const info = account.account.data.parsed.info;
        return info.tokenAmount.amount === '1' && info.tokenAmount.decimals === 0;
      });

      return nftAccounts;
    } catch (error) {
      console.error('Error fetching wallet NFTs:', error);
      return [];
    }
  }

  // Stake tokens for rewards
  async stakeTokens(
    walletPublicKey: PublicKey,
    amount: number,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<string | null> {
    try {
      const transaction = new Transaction();
      
      // Create staking instruction
      const stakeInstruction = SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: new PublicKey(this.config.programId),
        lamports: amount * LAMPORTS_PER_SOL
      });
      
      transaction.add(stakeInstruction);
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPublicKey;
      
      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error staking tokens:', error);
      return null;
    }
  }

  // Get transaction history
  async getTransactionHistory(walletAddress: PublicKey, limit: number = 20): Promise<any[]> {
    try {
      const signatures = await this.connection.getSignaturesForAddress(
        walletAddress,
        { limit }
      );

      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getTransaction(sig.signature);
          return {
            signature: sig.signature,
            slot: sig.slot,
            timestamp: sig.blockTime,
            status: tx?.meta?.err ? 'failed' : 'success',
            fee: tx?.meta?.fee
          };
        })
      );

      return transactions;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Helper methods
  private createHorseMetadata(horseData: HorseNFTData): NFTMetadata {
    return {
      name: `Horse #${horseData.id}`,
      symbol: 'HORSE',
      description: `A unique racing horse NFT with exceptional genetics and performance capabilities.`,
      image: `https://api.solhorse.game/horses/${horseData.id}/image.png`,
      attributes: [
        { trait_type: 'Bloodline', value: horseData.genetics.bloodline },
        { trait_type: 'Rarity', value: horseData.genetics.rarity },
        { trait_type: 'Speed', value: horseData.genetics.baseSpeed },
        { trait_type: 'Stamina', value: horseData.genetics.stamina },
        { trait_type: 'Agility', value: horseData.genetics.agility },
        { trait_type: 'Intelligence', value: horseData.genetics.intelligence },
        { trait_type: 'Temperament', value: horseData.genetics.temperament },
        { trait_type: 'Generation', value: horseData.genetics.generation },
        { trait_type: 'Wins', value: horseData.stats.wins },
        { trait_type: 'Races', value: horseData.stats.races }
      ],
      properties: {
        files: [
          {
            uri: `https://api.solhorse.game/horses/${horseData.id}/image.png`,
            type: 'image/png'
          }
        ],
        category: 'image'
      }
    };
  }

  private async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    // In production, this would upload to IPFS or Arweave
    // For demo purposes, return a mock URI
    return `https://api.solhorse.game/metadata/${Date.now()}.json`;
  }

  // Utility method to check if transaction was successful
  async isTransactionSuccessful(signature: string): Promise<boolean> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      return status.value?.confirmationStatus === 'confirmed' && !status.value?.err;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return false;
    }
  }
}

// Export singleton instance
const solanaConfig: SolanaConfig = {
  network: 'devnet',
  rpcUrl: 'https://api.devnet.solana.com',
  programId: 'SolHorseProgram1111111111111111111111111111'
};

export const solanaService = new SolanaService(solanaConfig);
export default solanaService;