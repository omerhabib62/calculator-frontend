"use client";

import { useState, useEffect } from "react";
import { Operation, CalculationHistory } from "@/types/calculator";
import { CalculatorApi } from "@/services/calculatorApi";

interface TestResults {
  sum: number;
  multiply: number;
  subtract: number;
  divide: number;
  health: string;
}

export default function Calculator() {
  const [operation, setOperation] = useState<Operation>("sum");
  const [numbersInput, setNumbersInput] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [testResults, setTestResults] = useState<TestResults | null>(null);

  // Check connection to your microservices on component mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      await CalculatorApi.healthCheck();
      setIsConnected(true);
      setError("");
    } catch (error) {
      setIsConnected(false);
      const errorMessage =
        error instanceof Error ? error.message : "Connection failed";
      setError(errorMessage);
    }
  };

  const handleCalculate = async () => {
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      // Parse numbers from input (same validation as your test client)
      if (!numbersInput.trim()) {
        throw new Error("Please enter at least one number");
      }

      const numbers = numbersInput.split(",").map((str) => {
        const trimmed = str.trim();
        if (!trimmed) {
          throw new Error("Empty number found in input");
        }
        const num = parseFloat(trimmed);
        if (isNaN(num)) {
          throw new Error(`Invalid number: "${trimmed}"`);
        }
        return num;
      });

      if (numbers.length === 0) {
        throw new Error("Please enter at least one number");
      }

      // Call your microservices gateway
      const response = await CalculatorApi.calculate({
        operation,
        numbers,
      });

      setResult(response.result);

      // Add to history
      const calculation: CalculationHistory = {
        id: crypto.randomUUID(),
        operation,
        numbers,
        result: response.result,
        timestamp: new Date(),
      };

      setHistory((prev) => [calculation, ...prev.slice(0, 9)]);

      // Log like your test client
      console.log(
        `Result of ${operation}([${numbers.join(",")}]): ${response.result}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const runTests = async () => {
    setIsLoading(true);
    setError("");
    setTestResults(null);

    try {
      const results = await CalculatorApi.runAllTests();
      setTestResults(results);

      // Add test results to history
      const testHistory: CalculationHistory[] = [
        {
          id: crypto.randomUUID(),
          operation: "sum",
          numbers: [1, 2, 3, 4],
          result: results.sum,
          timestamp: new Date(),
        },
        {
          id: crypto.randomUUID(),
          operation: "multiply",
          numbers: [2, 3, 4],
          result: results.multiply,
          timestamp: new Date(),
        },
        {
          id: crypto.randomUUID(),
          operation: "subtract",
          numbers: [10, 3, 2],
          result: results.subtract,
          timestamp: new Date(),
        },
        {
          id: crypto.randomUUID(),
          operation: "divide",
          numbers: [100, 5, 2],
          result: results.divide,
          timestamp: new Date(),
        },
      ];

      setHistory((prev) => [...testHistory, ...prev]);
      setResult(results.divide); // Show last result
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Test failed with unknown error";
      setError(`Test failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const operationLabels: Record<Operation, string> = {
    sum: "Addition (+)",
    subtract: "Subtraction (−)",
    multiply: "Multiplication (×)",
    divide: "Division (÷)",
  };

  const quickTests: Array<{
    operation: Operation;
    numbers: number[];
    expected: number;
  }> = [
    { operation: "sum", numbers: [1, 2, 3, 4], expected: 10 },
    { operation: "multiply", numbers: [2, 3, 4], expected: 24 },
    { operation: "subtract", numbers: [10, 3, 2], expected: 5 },
    { operation: "divide", numbers: [100, 5, 2], expected: 10 },
  ];

  // Fixed: Renamed from "useQuickTest" to "applyQuickTest" to avoid React Hook rules
  const applyQuickTest = (test: (typeof quickTests)[0]) => {
    setOperation(test.operation);
    setNumbersInput(test.numbers.join(", "));
    setResult(null);
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🧮 Calculator Microservices Frontend
        </h1>
        <p className="text-gray-600 mb-4">
          Next.js frontend connected to NestJS microservices
        </p>

        {/* Connection Status */}
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm border">
          {isConnected === null ? (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-600">Checking connection...</span>
            </>
          ) : isConnected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600">
                Connected to localhost:3001
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-600">Disconnected</span>
              <button
                onClick={checkConnection}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Retry
              </button>
            </>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-yellow-800 font-semibold text-lg mb-2">
            ⚠️ Microservices Not Running
          </h3>
          <p className="text-yellow-700 mb-3">
            Make sure your calculator microservices are running. Open separate
            terminals and run:
          </p>
          <div className="bg-yellow-100 rounded p-3 font-mono text-sm text-yellow-800 space-y-1">
            <div>cd /home/omers-pc/Projects/calculator-backend</div>
            <div># Start all services in separate terminals:</div>
            <div>cd gateway && npm start</div>
            <div>cd sum && npm start</div>
            <div>cd subtract && npm start</div>
            <div>cd multiply && npm start</div>
            <div>cd divide && npm start</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator Form - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Calculator
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operation
                </label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value as Operation)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!isConnected}
                >
                  {Object.entries(operationLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numbers (comma-separated)
                </label>
                <input
                  type="text"
                  value={numbersInput}
                  onChange={(e) => setNumbersInput(e.target.value)}
                  placeholder="e.g., 1, 2, 3, 4"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!isConnected}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !isLoading && handleCalculate()
                  }
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter numbers separated by commas. Press Enter to calculate.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCalculate}
                  disabled={isLoading || !numbersInput.trim() || !isConnected}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Calculating..." : "Calculate"}
                </button>

                <button
                  onClick={runTests}
                  disabled={isLoading || !isConnected}
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Run All Tests
                </button>
              </div>
            </div>

            {/* Quick Test Buttons */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Quick Tests (from your test-client.ts):
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickTests.map((test, index) => (
                  <button
                    key={index}
                    onClick={() => applyQuickTest(test)}
                    disabled={!isConnected}
                    className="p-2 text-left text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    <div className="font-medium">
                      {operationLabels[test.operation]}
                    </div>
                    <div className="text-gray-500">
                      [{test.numbers.join(", ")}] = {test.expected}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Result Display */}
            {result !== null && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ Result
                </h3>
                <p className="text-3xl font-bold text-green-900">{result}</p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  ❌ Error
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Test Results */}
            {testResults && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  🧪 Test Results
                </h3>
                <div className="space-y-1 text-sm text-blue-700">
                  <div>Sum([1,2,3,4]): {testResults.sum}</div>
                  <div>Multiply([2,3,4]): {testResults.multiply}</div>
                  <div>Subtract([10,3,2]): {testResults.subtract}</div>
                  <div>Divide([100,5,2]): {testResults.divide}</div>
                  <div>Health: {testResults.health}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History - Right Side */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">History</h2>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No calculations yet
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((calc) => (
                  <div
                    key={calc.id}
                    className="p-3 bg-gray-50 rounded-md border-l-4 border-blue-500"
                  >
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {operationLabels[calc.operation]}
                      </div>
                      <div className="text-gray-600">
                        [{calc.numbers.join(", ")}] ={" "}
                        <span className="font-semibold">{calc.result}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {calc.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
