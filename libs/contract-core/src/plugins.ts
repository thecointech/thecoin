import { getFxRate, FXRate } from '@thecointech/fx-rates';
import { COIN_EXP, PERMISSION_BALANCE } from './constants';
import { Erc20Provider } from '@thecointech/ethers-provider/Erc20Provider';
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import parser from '@solidity-parser/parser'
import type { PluginAndPermissionsStructOutput, TheCoin } from './types/contracts/TheCoin';
import type { BaseASTNode, ContractDefinition, FunctionDefinition, NumberLiteral, StateVariableDeclaration, VariableDeclarationStatement, VariableDeclaration, FunctionCall, MemberAccess, Identifier, Expression, BinaryOperation, TupleExpression, ReturnStatement } from '@solidity-parser/parser/dist/src/ast-types';

export type PluginBalanceMod = (balance: Decimal, timestamp: DateTime, rates: FXRate[]) => Decimal;
export type PluginDetails = {
  address: string;
  permissions: Decimal;
  modifier: PluginBalanceMod|null,
}

export async function getPluginDetails(tcCore: TheCoin) : Promise<PluginDetails[]>{
  const user = await tcCore.signer.getAddress();
  const plugins = await tcCore.getUsersPlugins(user);
  const details = plugins.map(async (plugin) => ({
    address: plugin.plugin,
    permissions: new Decimal(plugin.permissions.toString()),
    modifier: await getPluginModifier(plugin),
  }))
  return Promise.all(details)
}

async function getPluginModifier({plugin, permissions}: PluginAndPermissionsStructOutput) : Promise<PluginBalanceMod|null> {

  const provider = new Erc20Provider();

  // if this doesn't modify the balance, we don't need a modifier
  if (permissions.mask(PERMISSION_BALANCE).eq(0)) {
    return null;
  }

  const source = await provider.getSourceCode(plugin);
  const parsed = parser.parse(source);

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

  return (balance: Decimal, timestamp: DateTime, rates: FXRate[]) => {
    const variables: any = {
      ...defaultVariables,
      block: { timestamp: Math.round(timestamp.toSeconds()) },
      currentBalance: balance,
      _rates: rates,
    };
    for (const statement of statements) {
      if (isVariableDeclStmt(statement)) {

        for (const variable of statement.variables) {
          if (isVariableDecl(variable)) {
            variables[variable.name!] = getValue(statement.initialValue, variables);
          }
        }
      }
      else if (isReturn(statement)) {
        variables.return = getValue(statement.expression, variables);
      }
    }
    // const newBalance = contract.balanceOf(address, balance);
    // return newBalance.toNumber();
    return variables.return;
  }
}

const getValue = (initialValue: Expression|null, variables: any) : Decimal => {
  switch (initialValue?.type) {
    case "FunctionCall": return callFunction(initialValue, variables);
    case "BinaryOperation": return binaryOperation(initialValue, variables);
    case "TupleExpression": return tupleExpression(initialValue, variables);
    case "Identifier": return identifier(initialValue, variables);
    default: throw new Error("missing type");
  }
}

const binaryOperation = (initialValue: BinaryOperation, variables: any) => {
  const left: Decimal = getValue(initialValue.left, variables);
  const right: Decimal = getValue(initialValue.right, variables);

  switch (initialValue.operator) {
    // case "+": return variables[initialValue.left.name] + variables[initialValue.right.name];
    // case "-": return variables[initialValue.left.name] - variables[initialValue.right.name];
    case "*": return left.mul(right);
    case "/": return left.dividedToIntegerBy(right);
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


const callFunction = (fnCall: FunctionCall, variables: any) => {
  const args = fnCall.arguments.map(arg => {
    if (isMemberAccess(arg))
      return variables[(arg.expression as Identifier).name][arg.memberName];
    if (isIdentifier(arg))
      return variables[arg.name]

    return "unknown";
  })

  if (isIdentifier(fnCall.expression)) {
    switch(fnCall.expression.name) {
      case "toFiat": return toFiat(args, variables._rates);
      case "toCoin": return toCoin(args, variables._rates);
    }
  }
  throw new Error("Missing fn implementation");
}

const avgRate = (rate: FXRate) => ((rate.sell + rate.buy) / 2) || 1;

export const toFiat = ([coin, timestamp]: any[], rates: FXRate[]) => {
  const rate = getFxRate(rates, timestamp * 1000)
  return new Decimal(coin)
    .mul(rate.fxRate)
    .mul(avgRate(rate))
    .div(COIN_EXP)
    .mul(100)
    .toint();
}
export const toCoin = ([fiat, timestamp]: any[], rates: FXRate[]) => {
  const rate = getFxRate(rates, timestamp * 1000)
  return new Decimal(fiat)
    .div(100)
    .mul(COIN_EXP)
    .div(avgRate(rate))
    .div(rate.fxRate)
    .toint();
}

const isIdentifier = (node: BaseASTNode|null) : node is Identifier => node?.type === "Identifier";
const isMemberAccess = (node: BaseASTNode|null) : node is MemberAccess => node?.type === "MemberAccess";
// const isFuncCall = (node: BaseASTNode|null) : node is FunctionCall => node?.type === "FunctionCall";
const isNumberLiteral = (node: BaseASTNode|null) : node is NumberLiteral => node?.type == "NumberLiteral";
const isVariableDecl = (node: BaseASTNode|null) : node is VariableDeclaration => node?.type == "VariableDeclaration";
const isVariableDeclStmt = (node: BaseASTNode) : node is VariableDeclarationStatement => node.type == "VariableDeclarationStatement";
const isReturn = (node: BaseASTNode|null) : node is ReturnStatement => node?.type == "ReturnStatement";
