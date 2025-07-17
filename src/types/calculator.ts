export type Operation = 'sum' | 'subtract' | 'multiply' | 'divide';

export interface CalculationRequest {
  operation: Operation;
  numbers: number[];
}

export interface CalculationResponse {
  result: number;
}

export interface CalculationHistory {
  id: string;
  operation: Operation;
  numbers: number[];
  result: number;
  timestamp: Date;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}