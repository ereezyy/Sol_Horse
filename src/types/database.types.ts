export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          walletAddress: string
          username: string
          profileData: Json
          assetsData: Json
          statsData: Json
          socialData: Json
          preferencesData: Json
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          walletAddress: string
          username: string
          profileData?: Json
          assetsData?: Json
          statsData?: Json
          socialData?: Json
          preferencesData?: Json
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          walletAddress?: string
          username?: string
          profileData?: Json
          assetsData?: Json
          statsData?: Json
          socialData?: Json
          preferencesData?: Json
          createdAt?: string
          updatedAt?: string
        }
      }
      horses: {
        Row: {
          id: string
          tokenId: string
          name: string
          geneticsData: Json
          statsData: Json
          breedingData: Json
          trainingData: Json
          appearanceData: Json
          loreData: Json
          owner: string
          isForSale: boolean
          price: number | null
          isForLease: boolean
          leaseTermsData: Json | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          tokenId: string
          name: string
          geneticsData?: Json
          statsData?: Json
          breedingData?: Json
          trainingData?: Json
          appearanceData?: Json
          loreData?: Json
          owner: string
          isForSale?: boolean
          price?: number | null
          isForLease?: boolean
          leaseTermsData?: Json | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          tokenId?: string
          name?: string
          geneticsData?: Json
          statsData?: Json
          breedingData?: Json
          trainingData?: Json
          appearanceData?: Json
          loreData?: Json
          owner?: string
          isForSale?: boolean
          price?: number | null
          isForLease?: boolean
          leaseTermsData?: Json | null
          createdAt?: string
          updatedAt?: string
        }
      }
      races: {
        Row: {
          id: string
          name: string
          type: string
          surface: string
          distance: number
          tier: string
          conditionsData: Json
          requirementsData: Json
          entryFee: number
          prizePool: number
          prizeDistribution: Json
          participantsData: Json
          maxParticipants: number
          registrationDeadline: string
          raceTime: string
          resultsData: Json | null
          status: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          name: string
          type: string
          surface: string
          distance: number
          tier: string
          conditionsData?: Json
          requirementsData?: Json
          entryFee: number
          prizePool: number
          prizeDistribution?: Json
          participantsData?: Json
          maxParticipants: number
          registrationDeadline: string
          raceTime: string
          resultsData?: Json | null
          status: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          surface?: string
          distance?: number
          tier?: string
          conditionsData?: Json
          requirementsData?: Json
          entryFee?: number
          prizePool?: number
          prizeDistribution?: Json
          participantsData?: Json
          maxParticipants?: number
          registrationDeadline?: string
          raceTime?: string
          resultsData?: Json | null
          status?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string
          type: string
          requirementsData: Json
          prizePool: number
          prizeDistribution: Json
          registrationStart: string
          registrationEnd: string
          tournamentStart: string
          tournamentEnd: string
          participantsData: Json
          bracketsData: Json | null
          status: string
          category: string | null
          tier: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          name: string
          description: string
          type: string
          requirementsData?: Json
          prizePool: number
          prizeDistribution?: Json
          registrationStart: string
          registrationEnd: string
          tournamentStart: string
          tournamentEnd: string
          participantsData?: Json
          bracketsData?: Json | null
          status: string
          category?: string | null
          tier?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          type?: string
          requirementsData?: Json
          prizePool?: number
          prizeDistribution?: Json
          registrationStart?: string
          registrationEnd?: string
          tournamentStart?: string
          tournamentEnd?: string
          participantsData?: Json
          bracketsData?: Json | null
          status?: string
          category?: string | null
          tier?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      bets: {
        Row: {
          id: string
          playerId: string
          raceId: string
          horseId: string
          type: string
          amount: number
          odds: number
          potentialPayout: number
          status: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          playerId: string
          raceId: string
          horseId: string
          type: string
          amount: number
          odds: number
          potentialPayout: number
          status: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          playerId?: string
          raceId?: string
          horseId?: string
          type?: string
          amount?: number
          odds?: number
          potentialPayout?: number
          status?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      marketplace_listings: {
        Row: {
          id: string
          type: string
          itemId: string
          sellerId: string
          price: number
          currency: string
          negotiable: boolean
          title: string
          description: string
          imagesData: Json
          listedAt: string
          expiresAt: string
          status: string
          views: number
          watchersData: Json
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          type: string
          itemId: string
          sellerId: string
          price: number
          currency: string
          negotiable?: boolean
          title: string
          description: string
          imagesData?: Json
          listedAt: string
          expiresAt: string
          status: string
          views?: number
          watchersData?: Json
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          type?: string
          itemId?: string
          sellerId?: string
          price?: number
          currency?: string
          negotiable?: boolean
          title?: string
          description?: string
          imagesData?: Json
          listedAt?: string
          expiresAt?: string
          status?: string
          views?: number
          watchersData?: Json
          createdAt?: string
          updatedAt?: string
        }
      }
      guilds: {
        Row: {
          id: string
          name: string
          description: string
          founderId: string
          membersData: Json
          statsData: Json
          featuresData: Json
          requirementsData: Json
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          name: string
          description: string
          founderId: string
          membersData?: Json
          statsData?: Json
          featuresData?: Json
          requirementsData?: Json
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          founderId?: string
          membersData?: Json
          statsData?: Json
          featuresData?: Json
          requirementsData?: Json
          createdAt?: string
          updatedAt?: string
        }
      }
      training_sessions: {
        Row: {
          id: string
          horseId: string
          programId: string
          startTime: string
          endTime: string
          status: string
          resultsData: Json | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          horseId: string
          programId: string
          startTime: string
          endTime: string
          status: string
          resultsData?: Json | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          horseId?: string
          programId?: string
          startTime?: string
          endTime?: string
          status?: string
          resultsData?: Json | null
          createdAt?: string
          updatedAt?: string
        }
      }
      breeding_records: {
        Row: {
          id: string
          mareId: string
          stallionId: string
          offspringId: string | null
          success: boolean
          cost: number
          timestamp: string
          geneticsData: Json | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          mareId: string
          stallionId: string
          offspringId?: string | null
          success: boolean
          cost: number
          timestamp: string
          geneticsData?: Json | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          mareId?: string
          stallionId?: string
          offspringId?: string | null
          success?: boolean
          cost?: number
          timestamp?: string
          geneticsData?: Json | null
          createdAt?: string
          updatedAt?: string
        }
      }
      notifications: {
        Row: {
          id: string
          playerId: string
          type: string
          title: string
          message: string
          timestamp: string
          read: boolean
          actionUrl: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          playerId: string
          type: string
          title: string
          message: string
          timestamp: string
          read: boolean
          actionUrl?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          playerId?: string
          type?: string
          title?: string
          message?: string
          timestamp?: string
          read?: boolean
          actionUrl?: string | null
          createdAt?: string
          updatedAt?: string
        }
      }
      transactions: {
        Row: {
          id: string
          playerId: string
          type: string
          amount: number
          currency: string
          relatedId: string | null
          description: string
          timestamp: string
          signature: string | null
          status: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          playerId: string
          type: string
          amount: number
          currency: string
          relatedId?: string | null
          description: string
          timestamp: string
          signature?: string | null
          status: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          playerId?: string
          type?: string
          amount?: number
          currency?: string
          relatedId?: string | null
          description?: string
          timestamp?: string
          signature?: string | null
          status?: string
          createdAt?: string
          updatedAt?: string
        }
      }
    }
  }
}