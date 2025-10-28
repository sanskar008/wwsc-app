export interface CalculationRequest {
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'power' | 'sqrt' | 'factorial';
  operands: number[];
}

export interface CalculationResponse {
  result: number;
  operation: string;
  operands: number[];
  timestamp: Date;
}

export class MathCalculator {
  static add(operands: number[]): number {
    if (operands.length < 2) {
      throw new Error('Addition requires at least 2 operands');
    }
    return operands.reduce((sum, num) => sum + num, 0);
  }

  static subtract(operands: number[]): number {
    if (operands.length < 2) {
      throw new Error('Subtraction requires at least 2 operands');
    }
    return operands.reduce((result, num, index) => {
      return index === 0 ? num : result - num;
    });
  }

  static multiply(operands: number[]): number {
    if (operands.length < 2) {
      throw new Error('Multiplication requires at least 2 operands');
    }
    return operands.reduce((product, num) => product * num, 1);
  }

  static divide(operands: number[]): number {
    if (operands.length !== 2) {
      throw new Error('Division requires exactly 2 operands');
    }
    if (operands[1] === 0) {
      throw new Error('Division by zero is not allowed');
    }
    return operands[0] / operands[1];
  }

  static power(operands: number[]): number {
    if (operands.length !== 2) {
      throw new Error('Power operation requires exactly 2 operands');
    }
    return Math.pow(operands[0], operands[1]);
  }

  static sqrt(operands: number[]): number {
    if (operands.length !== 1) {
      throw new Error('Square root operation requires exactly 1 operand');
    }
    if (operands[0] < 0) {
      throw new Error('Square root of negative number is not allowed');
    }
    return Math.sqrt(operands[0]);
  }

  static factorial(operands: number[]): number {
    if (operands.length !== 1) {
      throw new Error('Factorial operation requires exactly 1 operand');
    }
    if (operands[0] < 0 || !Number.isInteger(operands[0])) {
      throw new Error('Factorial requires a non-negative integer');
    }
    if (operands[0] > 170) {
      throw new Error('Factorial of numbers greater than 170 causes overflow');
    }
    
    let result = 1;
    for (let i = 2; i <= operands[0]; i++) {
      result *= i;
    }
    return result;
  }

  static calculate(request: CalculationRequest): CalculationResponse {
    const { operation, operands } = request;
    
    let result: number;
    
    switch (operation) {
      case 'add':
        result = this.add(operands);
        break;
      case 'subtract':
        result = this.subtract(operands);
        break;
      case 'multiply':
        result = this.multiply(operands);
        break;
      case 'divide':
        result = this.divide(operands);
        break;
      case 'power':
        result = this.power(operands);
        break;
      case 'sqrt':
        result = this.sqrt(operands);
        break;
      case 'factorial':
        result = this.factorial(operands);
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    return {
      result,
      operation,
      operands,
      timestamp: new Date()
    };
  }
}
