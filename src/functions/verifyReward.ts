// src/functions/verifyReward.ts

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Mock interfaces - in a real project these would be imported from model files
interface Merchant {
  id: string;
  name: string;
  apiKey: string;
  isActive: boolean;
}

interface Transaction {
  id: string;
  merchantId: string;
  userId: string;
  amount: number;
  timestamp: Date;
}

interface Reward {
  id: string;
  transactionId: string;
  userId: string;
  merchantId: string;
  amount: number;
  status: 'pending' | 'issued' | 'failed';
  createdAt: Date;
}

// Mock data services - in a real project these would likely be proper DB connectors
const getMerchantByApiKey = async (apiKey: string): Promise<Merchant | null> => {
  // This would be a database lookup in reality
  const merchants: Merchant[] = [
    {
      id: 'merchant1',
      name: 'Example Store',
      apiKey: 'valid-api-key-123',
      isActive: true
    },
    {
      id: 'merchant2',
      name: 'Inactive Store',
      apiKey: 'inactive-key-456',
      isActive: false
    }
  ];
  
  return merchants.find(m => m.apiKey === apiKey) || null;
};

const getTransactionById = async (id: string): Promise<Transaction | null> => {
  // This would be a database lookup in reality
  if (id === 'valid-transaction-123') {
    return {
      id: 'valid-transaction-123',
      merchantId: 'merchant1',
      userId: 'user1',
      amount: 100.00,
      timestamp: new Date()
    };
  }
  return null;
};

const getRewardByTransactionId = async (transactionId: string): Promise<Reward | null> => {
  // This would be a database lookup in reality
  if (transactionId === 'valid-transaction-123') {
    return {
      id: 'reward123',
      transactionId: 'valid-transaction-123',
      userId: 'user1',
      merchantId: 'merchant1',
      amount: 5.00,
      status: 'issued',
      createdAt: new Date()
    };
  }
  return null;
};

/**
 * Lambda function handler for verifying transaction rewards
 * 
 * This function expects:
 * - An API key in the headers for merchant authentication
 * - A transaction ID in the query parameters
 * 
 * It returns:
 * - Reward information if the transaction has an associated reward
 * - Appropriate error messages for invalid requests or authentication issues
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // 1. Extract and validate API key from headers
    // Assuming the Auth header is the API key as-is
    if (!event || !event.Authorization || event.Authorization.trim() === "") {
      throw new Error('Event does not have the required authorization header');
    }
    // 2. Authenticate the merchant
    const merchant = getMerchantByApiKey(event.Authorization);
    
    // 3. Extract and validate the transaction ID
    if (!event.body.id || event.body.id.trim() === "") {
      throw new Error('Event does not have any transaction id');
    }
    const transaction = getTransactionById(event.body.id)

    // 4. Verify the transaction belongs to the authenticated merchant
    if (typeof merchant == null) {
      throw new Error('Authorization does not match merchant');
    } else if (!merchant.isActive) {
      throw new Error('Merchant is not active');
    }

    if (typeof transaction == null) {
      throw new Error('Transaction does not exist');
    } else if (typeof transaction === "object" && transaction.merchantId != merchant.id) {
      throw new Error('Transaction does not match merchant');
    } else if (!transaction.status == 'processed') {
      throw new Error('Transaction has been processed or has failed previously');
    }

    // 5. Retrieve reward information
    const reward = getRewardByTransactionId(transaction.id)
    if (typeof reward == null) {
      throw new Error('Reward does not exist');
    }

    // 6. Return appropriate response
    return {
      statusCode: 200,
      body: JSON.stringify(reward)
    };
  } catch (error) {
    console.error('Error processing request:', error);

    // TODO: look for a cleaner way to handle different errors and responding
    if (error == 'Event does not have any transaction id') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: error })
      };
    }

    if (error == 'Event does not have the required authorization header') {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: error })
      };
    }

    if (error == 'Authorization does not match merchant'
        || error == 'Transaction does not match merchant') {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: error })
      };
    }

    if (error == 'Transaction does not exist') {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: error })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
