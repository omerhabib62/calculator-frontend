import axios, { AxiosError } from 'axios';
import { CalculationRequest, CalculationResponse } from '@/types/calculator';
/**
 * Test results interface for the runAllTests method
 */

interface TestResults {
  sum: number;
  multiply: number;
  subtract: number;
  divide: number;
  health: string;
}

export class CalculatorApi {
  private static gatewayUrl: string = process.env.NODE_ENV === 'production' 
    ? (process.env.NEXT_PUBLIC_CALCULATOR_GATEWAY_URL || 'https://your-production-api.com')
    : (process.env.NEXT_PUBLIC_CALCULATOR_GATEWAY_URL || 'http://192.168.100.23:3001');

  private static axiosInstance = axios.create({
    baseURL: this.gatewayUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Helper method to handle axios errors consistently
   */
  private static handleAxiosError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      
      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to calculator service. Backend may not be running.');
      }
      
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      
      if (axiosError.message) {
        throw new Error(axiosError.message);
      }
    }
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    
    throw new Error('An unknown error occurred');
  }

  /**
   * Calculate operation - calls your actual microservices
   */
  static async calculate(request: CalculationRequest): Promise<CalculationResponse> {
    try {
      const response = await this.axiosInstance.post<CalculationResponse>('/calculate', request);
      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  /**
   * Health check - same as your test-client.ts
   */
  static async healthCheck(): Promise<string> {
    try {
      const response = await this.axiosInstance.get<string>('/');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
        throw new Error('Calculator gateway is not running');
      }
      throw new Error('Health check failed');
    }
  }

  /**
   * Run all tests - EXACT copy of your test-client.ts with proper typing
   */
  static async runAllTests(): Promise<TestResults> {
    try {
      console.log('Testing Calculator Gateway...');

      // Test sum operation
      const sumResponse = await axios.post<CalculationResponse>(`${this.gatewayUrl}/calculate`, {
        operation: 'sum',
        numbers: [1, 2, 3, 4]
      });
      console.log(`Result of sum([1,2,3,4]): ${sumResponse.data.result}`);

      // Test multiply operation
      const multiplyResponse = await axios.post<CalculationResponse>(`${this.gatewayUrl}/calculate`, {
        operation: 'multiply',
        numbers: [2, 3, 4]
      });
      console.log(`Result of multiply([2,3,4]): ${multiplyResponse.data.result}`);

      // Test subtract operation
      const subtractResponse = await axios.post<CalculationResponse>(`${this.gatewayUrl}/calculate`, {
        operation: 'subtract',
        numbers: [10, 3, 2]
      });
      console.log(`Result of subtract([10,3,2]): ${subtractResponse.data.result}`);

      // Test divide operation
      const divideResponse = await axios.post<CalculationResponse>(`${this.gatewayUrl}/calculate`, {
        operation: 'divide',
        numbers: [100, 5, 2]
      });
      console.log(`Result of divide([100,5,2]): ${divideResponse.data.result}`);

      // Test the health endpoint
      const healthResponse = await axios.get<string>(this.gatewayUrl);
      console.log(`Gateway health check: ${healthResponse.data}`);

      return {
        sum: sumResponse.data.result,
        multiply: multiplyResponse.data.result,
        subtract: subtractResponse.data.result,
        divide: divideResponse.data.result,
        health: healthResponse.data
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Test execution failed';
        console.error('Error during test execution:', errorMessage);
        throw new Error(errorMessage);
      }
      
      if (error instanceof Error) {
        console.error('Error during test execution:', error.message);
        throw error;
      }
      
      console.error('Error during test execution: Unknown error');
      throw new Error('Unknown error during test execution');
    }
  }
}