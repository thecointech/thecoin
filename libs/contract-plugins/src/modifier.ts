import { getFxRate, FXRate } from '@thecointech/fx-rates';
import { COIN_EXP } from '@thecointech/contract-base';
import { PERMISSION_BALANCE } from './constants';
import { Erc20Provider } from '@thecointech/ethers-provider/Erc20Provider';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import parser from '@solidity-parser/parser'
import type { PluginAndPermissionsStructOutput } from './types/contracts/IPluggable';
import type { BaseASTNode, ContractDefinition, FunctionDefinition, StateVariableDeclaration, VariableDeclarationStatement, VariableDeclaration, FunctionCall, MemberAccess, Identifier, Expression, BinaryOperation, TupleExpression, ReturnStatement, IndexAccess, IfStatement, ExpressionStatement } from '@solidity-parser/parser/dist/src/ast-types';
import type { ContractState, PluginBalanceMod } from './types';
import { getPluginLogs, updateState } from './logs';

export async function getPluginModifier(user: string, {plugin, permissions}: PluginAndPermissionsStructOutput) : Promise<PluginBalanceMod|null> {

  const provider = new Erc20Provider();

  // if this doesn't modify the balance, we don't need to emulate it
  if (permissions.mask(PERMISSION_BALANCE).eq(0)) {
    return null;
  }

  const source = await provider.getSourceCode(plugin);
  const parsed = parser.parse(source);

  const contract = parsed.children.find(c => c.type == "ContractDefinition") as ContractDefinition;
  const solBalanceOf = contract.subNodes.filter(f => f.type == "FunctionDefinition")
    .map(f => f as FunctionDefinition)
    .find(f => f.name == "balanceOf");

  const statements = solBalanceOf?.body?.statements;
  if (!statements?.length) return null;

  const initialState = getInitialContractState(contract);
  const logs = await getPluginLogs(plugin, user, provider, 0);

  // balanceOf, can only be called with incrementing timestamps.
  // It references currentState which is only updated within this fn
  const balanceOf = (balance: Decimal, timestamp: DateTime, rates: FXRate[]) => {

    const variables = {
      ...updateState(initialState, timestamp, logs),
      user,
      block: { timestamp: new Decimal(timestamp.toSeconds()).toInteger() },
      currentBalance: balance,
      __$rates: rates,
    } as ContractState;
    let returnVal: Decimal|undefined = undefined;
    const runStatements = (statements: BaseASTNode[]) => {
      for (const statement of statements) {
        // Once return is requested, no more statements will run
        if (returnVal) return;

        if (isVariableDeclStmt(statement)) {
          for (const variable of statement.variables) {
            if (isVariableDecl(variable)) {
              variables[variable.name!] = getValue(statement.initialValue, variables);
            }
          }
        }
        else if (isIfStatement(statement)) {
          const condition = getValue(statement.condition, variables);
          if (condition) {
            if (statement.trueBody.type == "Block") {
              runStatements(statement.trueBody.statements);
            }
            else {
              throw new Error("Unhandled case here");
            }
          }
        }
        else if (isExpressionStatement(statement)) {
          evaluateExpression(statement, variables);
        }
        else if (isReturn(statement)) {
          returnVal = getValue(statement.expression, variables);
        }
      }
    }

    runStatements(statements);
    return returnVal!;
  }

  return balanceOf;
}

function getInitialContractState(contract: ContractDefinition) {
  const initialState: ContractState = {};
  const classVariables = contract.subNodes.filter(f => f.type == "StateVariableDeclaration") as StateVariableDeclaration[];
  for (const stateVariable of classVariables) {
    for (const variable of stateVariable.variables.filter(v => v.name)) {
      const { name, expression } = variable;
      if (name == null) throw new Error("Whats this?");
      if (expression != null) {
        initialState[name] = getValue(expression, {});
      }
      else {
        switch (variable.typeName?.type) {
          case "Mapping":
            initialState[name] = {} as Record<string, any>;
            break;
          case 'UserDefinedTypeName':
            if (variable.typeName.namePath != "IPluggable") {
              throw new Error("Unknown Variable Type");
            }
            break; // We don't use this at the moment...
          default:
            throw new Error("Unknown Variable Type");
        }
      }
    }
  }
  return initialState;
}

const evaluateExpression = ({expression}: ExpressionStatement, variables: any) => {
  switch (expression?.type) {
    case "BinaryOperation": {
      if (expression.operator == "=") {
        const right = getValue(expression.right, variables);
        const accessor = (expression.left as Identifier).name;
        variables[accessor] = right;
      }
    }
  }
}

const getValue = (initialValue: Expression|null, variables: any) : Decimal => {
  switch (initialValue?.type) {
    case "MemberAccess": return memberAccess(initialValue, variables);
    case "FunctionCall": return callFunction(initialValue, variables);
    case "BinaryOperation": return binaryOperation(initialValue, variables);
    case "TupleExpression": return tupleExpression(initialValue, variables);
    case "Identifier": return identifier(initialValue, variables);
    case "IndexAccess": return indexAccess(initialValue, variables);
    case "NumberLiteral": return new Decimal(initialValue.number);
    default: throw new Error("missing type");
  }
}

function binaryOperation(initialValue: BinaryOperation, variables: any) : any {
  const left: Decimal = getValue(initialValue.left, variables);
  const right: Decimal = getValue(initialValue.right, variables);

  switch (initialValue.operator) {
    case "+": return left.add(right);
    case "-": return left.sub(right);
    case "*": return left.mul(right);
    case "/": return left.dividedToIntegerBy(right);
    case '!=': return !left.eq(right);
    case '==': return left.eq(right);
    default: throw new Error("Invalid operation");
  }
}
function tupleExpression(tuple: TupleExpression, variables: any) {
  let r = getValue(tuple.components[0] as Expression, variables);
  for (const c in tuple.components.slice(1)) {
    r = r.add(getValue(tuple.components[c] as Expression, variables));
  }
  return r;
}
function identifier(identifier: Identifier, variables: any) {
  return variables[identifier.name];
}


function callFunction(fnCall: FunctionCall, variables: any) {
  const args = fnCall.arguments.map(arg => getValue(arg, variables))

  if (isIdentifier(fnCall.expression)) {
    switch(fnCall.expression.name) {
      case "toFiat": return toFiat(args, variables.__$rates);
      case "toCoin": return toCoin(args, variables.__$rates);
      case "msNow": return variables.block.timestamp.mul(1000);
    }
  }
  else if (fnCall.expression.type == "ElementaryTypeName") {
    switch(fnCall.expression.name) {
      case "int": return args[0]; // Cast to int
    }
  }
  throw new Error(`Missing fn implementation: ${JSON.stringify(fnCall.expression)}`);
}

function indexAccess(accessor: IndexAccess, variables: any): Decimal {
  const mapping = getValue(accessor.base, variables) as any;
  const index = getValue(accessor.index, variables) as any;
  return mapping[index] ?? new Decimal(0);
}

function memberAccess(memberAccess: MemberAccess, variables: any): Decimal {
  var obj = getValue(memberAccess.expression, variables) as any;
  return obj[memberAccess.memberName] ?? new Decimal(0);
}

const avgRate = (rate: FXRate) => ((rate.sell + rate.buy) / 2) || 1;

export const toFiat = ([coin, timestamp]: any[], rates: FXRate[]) => {
  const rate = getFxRate(rates, timestamp.mul(1000).toNumber());
  // If no exchange rate, return 0?
  if (!rate.fxRate || !rate.buy) {
    return new Decimal(0);
  }
  return new Decimal(coin)
    .mul(rate.fxRate)
    .mul(avgRate(rate))
    .div(COIN_EXP)
    .mul(100)
    .toint();
}
export const toCoin = ([fiat, timestamp]: any[], rates: FXRate[]) => {
  const rate = getFxRate(rates, timestamp.mul(1000).toNumber());
  // If no exchange rate, return 0?
  if (!rate.fxRate || !rate.buy) {
    return new Decimal(0);
  }
  return new Decimal(fiat)
    .div(100)
    .mul(COIN_EXP)
    .div(avgRate(rate))
    .div(rate.fxRate)
    .toint();
}

const isIdentifier = (node: BaseASTNode|null) : node is Identifier => node?.type === "Identifier";
// const isMemberAccess = (node: BaseASTNode|null) : node is MemberAccess => node?.type === "MemberAccess";
// const isFuncCall = (node: BaseASTNode|null) : node is FunctionCall => node?.type === "FunctionCall";
// const isNumberLiteral = (node: BaseASTNode|null) : node is NumberLiteral => node?.type == "NumberLiteral";
// const isMapping = (node: BaseASTNode|null) : node is Mapping => node?.type == "Mapping";
const isExpressionStatement = (node: BaseASTNode|null) : node is ExpressionStatement => node?.type == "ExpressionStatement";
const isVariableDecl = (node: BaseASTNode|null) : node is VariableDeclaration => node?.type == "VariableDeclaration";
const isVariableDeclStmt = (node: BaseASTNode) : node is VariableDeclarationStatement => node.type == "VariableDeclarationStatement";
const isIfStatement = (node: BaseASTNode|null) : node is IfStatement => node?.type == "IfStatement";
const isReturn = (node: BaseASTNode|null) : node is ReturnStatement => node?.type == "ReturnStatement";


