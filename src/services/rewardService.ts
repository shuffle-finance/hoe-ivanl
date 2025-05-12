// src/services/rewardService.ts

// Issues found
// failure to get merchant or user returns null instead of an error, so cannot tell if it's a failure or no reward
// isActive check not done for users
// why console logging errors instead of failing
// type check for const reward: Reward

// reward object might benefit with an additional param describing failure
// no internal storage or logging of successful payment of reward
// discuss the mock with 200 wait timeout
// No comments / limited comments for functions

import { Transaction } from '../models/Transaction';
import { Reward } from '../models/Reward';
import { UserService } from './userService';
import { MerchantService } from './merchantService';
import { v4 as uuidv4 } from 'uuid';

export class RewardService {
  private userService: UserService;
  private merchantService: MerchantService;
  
  constructor(userService: UserService, merchantService: MerchantService) {
    this.userService = userService;
    this.merchantService = merchantService;
  }
  
  async processTransaction(transaction: Transaction): Promise<Reward> {
    // Create reward
    const reward: Reward = {
      id: uuidv4(), // Use UUID for unique reward IDs
      userId: transaction.userId,
      merchantId: transaction.merchantId,
      transactionId: transaction.id,
      amount: 0,
      percentage: 0,
      createdAt: new Date(),
      status: 'pending'
    };

    // Verify merchant is a partner
    let merchant;
    try {
      merchant = await this.merchantService.getMerchantById(transaction.merchantId);
    } catch (error) {
      console.error('Error fetching merchant:', error);
      reward.status = 'failed';
    }
    if (!merchant || !merchant.isActive) {
      console.error('Error fetching merchant: merchant not a partner or not active');
      reward.status = 'failed';
    }
    
    // Verify user exists
    let user;
    try {
      user = await this.userService.getUserById(transaction.userId);
    } catch (error) {
      console.error('Error fetching user:', error);
      reward.status = 'failed';
    }
    if (!user || !user.isActive) {
      console.error('Error fetching user: user does not exist or not active');
      reward.status = 'failed';
    }

    // since we cannot get both a user and a merchant record, we should return early
    if (reward.status == 'failed') {
      return reward
    }

    // Determine if user gets a reward (20% chance)
    const rewardChance = Math.random();
    if (rewardChance <= 0.2) {
      // Calculate reward amount (1-10% of transaction)
      const rewardPercentage = Math.floor(Math.random() * 10) + 1;
      const rewardAmount = transaction.amount * (rewardPercentage / 100);
      
      // Process reward
      try {
        // This could fail and leave the reward in a pending state with no retry mechanism
        await this.issueRewardToUser(reward);
        reward.status = 'issued';
        reward.amount = rewardAmount;
        reward.percentage = rewardPercentage;
        console.log('Reward issued successfully:', reward);
        // some form of transaction recording (more than a log) should be done here
      } catch (error) {
        console.error('Failed to issue reward:', error);
      }
    }
    
    return reward;
  }
  
  private async issueRewardToUser(reward: Reward): Promise<void> {
    // Simulate API call to payment processor
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 10% random failure rate to simulate API errors
        if (Math.random() < 0.1) {
          reject(new Error('Payment processor error'));
        } else {
          resolve();
        }
      }, 200);
    });
  }
  
  // This method has no error handling or retries
  async getRewardsForUser(userId: string): Promise<Reward[]> {
    const user = await this.userService.getUserById(userId);
    if (!user || !user.isActive) {
      return [];
    }
    
    // Should have pagination for large number of rewards
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock data - in reality this would be a database query
        resolve([
          {
            id: 'rwd-1',
            userId: userId,
            merchantId: 'merch-1',
            transactionId: 'tx-1',
            amount: 5.20,
            percentage: 5,
            createdAt: new Date(),
            status: 'issued'
          }
        ]);
      }, 100);
    });
  }
}
