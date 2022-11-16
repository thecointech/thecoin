import ContractSource from './RoundNumber.sol.json';
import parser from '@solidity-parser/parser'
import { fetchRate } from '@thecointech/fx-rates';
import type { BaseASTNode, ContractDefinition, FunctionDefinition, NumberLiteral, StateVariableDeclaration, VariableDeclarationStatement, VariableDeclaration, FunctionCall, MemberAccess, Identifier, Expression, BinaryOperation, TupleExpression, ReturnStatement } from '@solidity-parser/parser/dist/src/ast-types';
import Decimal from 'decimal.js-light';
import { COIN_EXP } from './constants';

type PluginBalanceMod = (balance: Decimal, seconds: number) => Promise<number>;

export async function getPluginModifier(address: string) : Promise<PluginBalanceMod|null> {

  // const provider = new Erc20Provider();


  // First easy one, just call the actual contract
  // const contract = IPlugin__factory.connect(address, provider);
  // const permissions = await contract.getPermissions();

  // if this doesn't modify the balance, we don't need a modifier
  // if (!(permissions.toNumber() & PERMISSION_BALANCE)) return null;

  //const source = provider.getSourceCode(address);
  const source = ContractSource.src;
  const token = parser.tokenize(source);
  const parsed = parser.parse(source);

  token; parsed;

  const contract = parsed.children.find(c => c.type == "ContractDefinition") as ContractDefinition;
  const solBalanceOf = contract.subNodes.filter(f => f.type == "FunctionDefinition")
    .map(f => f as FunctionDefinition)
    .find(f => f.name == "balanceOf");

  const defaultVariables: Record<string, string|Decimal> = {};
  const classVariables = contract.subNodes.filter(f => f.type == "StateVariableDeclaration") as StateVariableDeclaration[];
  for (const stateVariable of classVariables) {
    for (const variable of stateVariable.variables.filter(v => v.name)) {
      defaultVariables[variable.name!] = (
        isNumberLiteral(variable.expression)
          ? new Decimal(variable.expression.number)
          : "TODO"
      )
    }
  }
  const statements = solBalanceOf?.body?.statements;
  if (!statements?.length) return null;

  return async (balance: Decimal, seconds: number) => {
    const variables: any = {
      ...defaultVariables,
      block: { timestamp: seconds },
      currentBalance: balance,
    };
    for (const statement of statements) {
      if (isVariableDeclStmt(statement)) {

        for (const variable of statement.variables) {
          if (isVariableDecl(variable)) {
            variables[variable.name!] = await getValue(statement.initialValue, variables);
          }
        }
      }
      else if (isReturn(statement)) {
        variables.return = await getValue(statement.expression, variables);
      }
    }
    // const newBalance = await contract.balanceOf(address, balance);
    // return newBalance.toNumber();
    return variables.return;
  }
}

const getValue = (initialValue: Expression|null, variables: any) => {
  switch (initialValue?.type) {
    case "FunctionCall": return callFunction(initialValue, variables);
    case "BinaryOperation": return binaryOperation(initialValue, variables);
    case "TupleExpression": return tupleExpression(initialValue, variables);
    case "Identifier": return identifier(initialValue, variables);
    default: return 0;
  }
}

const binaryOperation = async (initialValue: BinaryOperation, variables: any) => {
  const left: Decimal = await getValue(initialValue.left, variables);
  const right: Decimal = await getValue(initialValue.right, variables);

  switch (initialValue.operator) {
    // case "+": return variables[initialValue.left.name] + variables[initialValue.right.name];
    // case "-": return variables[initialValue.left.name] - variables[initialValue.right.name];
    case "*": return left.mul(right);
    case "/": return left.dividedToIntegerBy(right);
    default: throw new Error("Invalid operation");
  }
}
async function tupleExpression(tuple: TupleExpression, variables: any) {
  let r = await getValue(tuple.components[0] as Expression, variables);
  for (const c in tuple.components.slice(1)) {
    r = r + await getValue(tuple.components[c] as Expression, variables);
  }
  return r;
}
function identifier(identifier: Identifier, variables: any) {
  return variables[identifier.name];
}


const callFunction = async (fnCall: FunctionCall, variables: any) => {
  const args = fnCall.arguments.map(arg => {
    if (isMemberAccess(arg))
      return variables[(arg.expression as Identifier).name][arg.memberName];
    if (isIdentifier(arg))
      return variables[arg.name]

    return "unknown";
  })

  if (isIdentifier(fnCall.expression)) {
    switch(fnCall.expression.name) {
      case "toFiat": return await toFiat(args);
      case "toCoin": return await toCoin(args);
    }
  }
  return 0;
}

export const toFiat = async ([coin, timestamp]: any[]) => {
  const rate = await fetchRate(new Date(timestamp * 1000))
  return new Decimal(coin)
    .mul(rate?.fxRate ?? 1)
    .mul(rate?.sell ?? 1)
    .div(COIN_EXP)
    .mul(100)
    .toint();
}
export const toCoin = async ([fiat, timestamp]: any[]) => {
  const rate = await fetchRate(new Date(timestamp * 1000))
  return new Decimal(fiat)
    .div(100)
    .mul(COIN_EXP)
    .div(rate?.sell ?? 1)
    .div(rate?.fxRate ?? 1)
    .toint();
}

const isIdentifier = (node: BaseASTNode|null) : node is Identifier => node?.type === "Identifier";
const isMemberAccess = (node: BaseASTNode|null) : node is MemberAccess => node?.type === "MemberAccess";
const isFuncCall = (node: BaseASTNode|null) : node is FunctionCall => node?.type === "FunctionCall";
const isNumberLiteral = (node: BaseASTNode|null) : node is NumberLiteral => node?.type == "NumberLiteral";
const isVariableDecl = (node: BaseASTNode|null) : node is VariableDeclaration => node?.type == "VariableDeclaration";
const isVariableDeclStmt = (node: BaseASTNode) : node is VariableDeclarationStatement => node.type == "VariableDeclarationStatement";
const isReturn = (node: BaseASTNode|null) : node is ReturnStatement => node?.type == "ReturnStatement";
