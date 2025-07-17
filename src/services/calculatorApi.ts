import axios from 'axios';
import { CalculationRequest, CalculationResponse } from '@/types/calculator';

export class CalculatorApi {
  private static gatewayUrl = 'http://localhost:3001';

  private static axiosInstance = axios.create({
    baseURL: this.gatewayUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Calculate operation - same as your test-client.ts
   */
  static async calculate(request: CalculationRequest): Promise<CalculationResponse> {
    try {
      const response = await this.axiosInstance.post('/calculate', request);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to calculator service. Make sure your microservices are running on localhost:3001');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Failed to perform calculation');
    }
  }

  /**
   * Health check - same as your test-client.ts
   */
  static async healthCheck(): Promise<string> {
    try {
      const response = await this.axiosInstance.get('/');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Calculator gateway is not running on localhost:3001');
      }
      throw new Error('Health check failed');
    }
  }

  /**
   * Run all tests - EXACT copy of your test-client.ts
   */
  static async runAllTests() {
    const gatewayUrl = 'http://localhost:3001';

    try {
      console.log('Testing Calculator Gateway...');

      // Test sum operation
      const sumResponse = await axios.post(`${gatewayUrl}/calculate`, {
        operation: 'sum',
        numbers: [1, 2, 3, 4]
      });
      console.log(`Result of sum([1,2,3,4]): ${sumResponse.data.result}`);

      // Test multiply operation
      const multiplyResponse = await axios.post(`${gatewayUrl}/calculate`, {
        operation: 'multiply',
        numbers: [2, 3, 4]
      });
      console.log(`Result of multiply([2,3,4]): ${multiplyResponse.data.result}`);

      // Test subtract operation
      const subtractResponse = await axios.post(`${gatewayUrl}/calculate`, {
        operation: 'subtract',
        numbers: [10, 3, 2]
      });
      console.log(`Result of subtract([10,3,2]): ${subtractResponse.data.result}`);

      // Test divide operation
      const divideResponse = await axios.post(`${gatewayUrl}/calculate`, {
        operation: 'divide',
        numbers: [100, 5, 2]
      });
      console.log(`Result of divide([100,5,2]): ${divideResponse.data.result}`);

      // Test the health endpoint
      const healthResponse = await axios.get(gatewayUrl);
      console.log(`Gateway health check: ${healthResponse.data}`);

      return {
        sum: sumResponse.data.result,
        multiply: multiplyResponse.data.result,
        subtract: subtractResponse.data.result,
        divide: divideResponse.data.result,
        health: healthResponse.data
      };

    } catch (error: any) {
      console.error('Error during test execution:', error.response?.data || error.message);
      throw error;
    }
  }
}