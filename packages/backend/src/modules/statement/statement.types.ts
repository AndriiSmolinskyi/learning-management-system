// statement.types.ts

export interface IValue {
  purchaseValue?: number
  marketValue?: number
}

export interface IDepositStatement {
  deposit: Array<IValue>;
}

export interface IPEStatement {
  pe: Array<IValue>;
}

export interface ICashStatement {
  cash: Array<IValue>;
}

export interface IMetalsStatement {
  metals: Array<IValue>;
}

export interface ICryptoStatement {
  crypto: Array<IValue>;
}

export interface IEquityStatement {
  equity: Array<IValue>;
}

export interface IBondsStatement {
  bonds: Array<IValue>;
}

export interface ITotalStatement {
  total: Array<IValue>;
}