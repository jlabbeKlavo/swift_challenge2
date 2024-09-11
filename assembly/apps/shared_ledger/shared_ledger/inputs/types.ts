import { JSON } from "@klave/sdk";
import { address, amount, datetime } from "../../klave/types";
import { TradeInfo } from "../trade";

@JSON 
export class SubmitTradeInput {
    SLID: string;               // SharedLedger ID
    UTI: string;                // Optional: UTI if generated externally
    tradeInfo: TradeInfo;         // Trade details
}

@JSON 
export class TradeInput {
    SLID: string;               // SharedLedger ID
    UTI: string;                // UTI of the trade
    tokenB64: string;           // Base64 encoded token
}

@JSON 
export class TradeIdentification {
    UTI: string;                // UTI of the trade
    tokenB64: string;           // Base64 encoded token

    constructor(UTI: string, tokenB64: string) {
        this.UTI = UTI;
        this.tokenB64 = tokenB64;
    }
}
@JSON
export class MultipleTradeInput {
    SLID: string;                       // SharedLedger ID
    trades: Array<TradeIdentification>; // Array of UTI and tokenB64    
}

@JSON 
export class ActionTradeInput {
    SLID: string;           // SharedLedger ID
    UTI: string;            // UTI of the trade
    tokenB64: string;       // Base64 encoded token
    publicData: boolean;       // Public or Private Data
    metadata: string;       // MetaData
}

@JSON 
export class KeyValueMatchInput {
    SLID: string;           // SharedLedger ID
    UTI: string;            // UTI of the trade
    tokenB64: string;       // Base64 encoded token
    key: string;            
    value: string;           
}

@JSON 
export class BoundaryMatchInput {
    SLID: string;           // SharedLedger ID
    UTI: string;            // UTI of the trade
    tokenB64: string;       // Base64 encoded token
    key: string;            
    min: amount;           
    max: amount;
}

@JSON 
export class LevenshteinMatchInput {
    SLID: string;           // SharedLedger ID
    UTI: string;            // UTI of the trade
    tokenB64: string;       // Base64 encoded token
    key: string;            
    value: string;           
    distance: amount;
}

@JSON 
export class SetIdentitiesInput {
    resetKlaveServer: boolean;
}

@JSON
export class UserRequestInput {
    SLID: string;
    role: string;
    jurisdiction: string;

    constructor(SLID: string, role: string, jurisdiction: string) {
        this.SLID = SLID;
        this.role = role;
        this.jurisdiction = jurisdiction;
    }
}

@JSON
export class ApproveUserRequestInput {
    userRequestId: string;    
}

@JSON
export class SharedLedgerIDInput {
    SLID: string;    
}
