import { Ledger, Crypto, JSON } from '@klave/sdk'
import { success, error } from "../klave/types"
import { encode as b64encode, decode as b64decode } from 'as-base64/assembly';
import { address, amount, datetime } from "../klave/types";
import { ActionTradeInput, SubmitTradeInput } from './inputs/types';
import { Context } from '@klave/sdk/assembly';
import { RoleType } from './user';
import { levenshtein } from './levenshtein';

const TradesTable = "TradesTable";

@JSON
export class TradeInfo {
    buyerName: address;             // Blockchain address of buyer  
    buyerCountry: string;           // Country of buyer             
    sellerName: address;            // Blockchain address of seller    
    sellerCountry: string;          // Country of seller
    asset: string;                  // Asset being traded           - custodian/clearing house
    quantity: amount;               // Quantity of the asset        
    price: amount;                  // Trade price                  
    tradeDate: datetime;            // Date and time of trade execution 
    jurisdiction: string;           // Jurisdiction of the trade

    constructor(tradeInput: TradeInfo) {
        this.buyerName = tradeInput.buyerName;
        this.sellerName = tradeInput.sellerName;
        this.buyerCountry = tradeInput.buyerCountry;
        this.sellerCountry = tradeInput.sellerCountry;
        this.asset = tradeInput.asset;
        this.quantity = tradeInput.quantity;
        this.price = tradeInput.price;
        this.tradeDate = tradeInput.tradeDate;
        this.jurisdiction = tradeInput.jurisdiction;
    }

    onlyKeepAsset(): void {
        this.buyerName = "";
        this.sellerName = "";
        this.buyerCountry = "";
        this.sellerCountry = "";
        this.quantity = 0;
        this.price = 0;
        this.tradeDate = "";
        this.jurisdiction = "";
    }
}

@JSON
export class TradeCreation {
    addedBy: address;       // Blockchain address of Trader
    datetime: datetime;     // Date and time of trade execution
    info: TradeInfo;        // MetaData for Trade Execution

    constructor(addedBy: address, datetime: datetime, info: TradeInfo) {
        this.addedBy = addedBy;
        this.datetime = datetime;
        this.info = info;
    }
}

@JSON
export class TradeComment {
    addedBy: address;       // Blockchain address of Broker
    role: RoleType;         // Role of the user adding the comment
    datetime: datetime;     // Date and time of trade execution
    metadata: string;       // MetaData for Trade Confirmation

    constructor(addedBy: address, role: RoleType, datetime: datetime, metadata: string) {
        this.addedBy = addedBy;
        this.role = role;
        this.datetime = datetime;
        this.metadata = metadata;
    }
}

@JSON
export class StatusLog {
    datetime: datetime;
    status: StatusType;

    constructor(datetime: datetime, status: StatusType) {
        this.datetime = datetime;
        this.status = status;
    }
}

@JSON 
export class AuditLog {
    performedBy: address;
    datetime: datetime;

    constructor(performedBy: address, datetime: datetime) {
        this.performedBy = performedBy;
        this.datetime = datetime;
    }
}

@JSON 
export class MatchLog {
    performedBy: address;
    datetime: datetime;
    matchedKey: string;
    matchedValue: string;

    constructor(performedBy: address, datetime: datetime, matchedKey: string, matchedValue: string) {
        this.performedBy = performedBy;
        this.datetime = datetime;
        this.matchedKey = matchedKey;
        this.matchedValue = matchedValue;
    }
}

/** Status types. */
export enum StatusType {    
    None = 0,
    Executed = 1,
    Settling = 2,
    Settled = 3
};

export function status_type(input: string): StatusType {
    if (input === "executed")
        return StatusType.Executed;  
    if (input === "settling")
        return StatusType.Settling;
    if (input === "settled")
        return StatusType.Settled;
    return StatusType.None;
}


@JSON
export class Trade {    
    UTI: string;                            //Unique Trade Identifier
    tokenB64: string;                       //Token allowing access to this trade

    tradeCreation: Array<TradeCreation>;        
    tradePublicComments: Array<TradeComment>;   
    tradePrivateComments: Array<TradeComment>;  

    matchTradeDetails: Array<MatchLog>;      // Settlement Agent => settling    (buyerName, buyerCountry, sellerName, sellerCountry)
    matchMoneyTransfer: Array<MatchLog>;     // Clearing House  (price) inputs(asset)
    matchAssetTransfer: Array<MatchLog>;     // Custodian       (quantity) inputs(asset)

    status: StatusType;                         // Current status (e.g., "executed", "settling", "settled")
    statusHistory : Array<StatusLog>;     
    auditHistory: Array<AuditLog>;         // Audit trail of the trade

    constructor(UTI: string, tradeInfo: TradeInfo) {
        this.UTI = UTI;
        if (UTI.length === 0) {
            //Create a UTI with a format corresponding to BOFAUS3N.TRADE20230905SEQ1234567890
            //<SWIFTCode>.TRADE<YYYYMMDD><sequence number for uniqueness>
            let datetime = parseInt(tradeInfo.tradeDate);
            let date = new Date(i64(datetime));
            this.UTI = "SWIFT" + b64encode(Crypto.Utils.convertToUint8Array(Crypto.getRandomValues(4))) + ".TRADE" + date.toISOString() + "SEQ" + b64encode(Crypto.Utils.convertToUint8Array(Crypto.getRandomValues(8)));
        }
        this.tradeCreation=new Array<TradeCreation>();
        this.tradePublicComments = new Array<TradeComment>();
        this.tradePrivateComments = new Array<TradeComment>();
        this.matchTradeDetails = new Array<MatchLog>();
        this.matchMoneyTransfer = new Array<MatchLog>();
        this.matchAssetTransfer = new Array<MatchLog>();

        this.tokenB64 = "";
        this.status = StatusType.Executed;
        this.statusHistory = new Array<StatusLog>();
        this.auditHistory = new Array<AuditLog>();
        this.tradeCreation.push(new TradeCreation(Context.get('sender'), Context.get("trusted_time"), tradeInfo));
        this.statusHistory.push(new StatusLog(Context.get("trusted_time"), this.status));
    }

    static load(UTI: string) : Trade | null {
        let TradeObject = Ledger.getTable(TradesTable).get(UTI);
        if (TradeObject.length === 0) {
            // error("Trade does not exists. Create it first");
            return null;
        }
        let Trade = JSON.parse<Trade>(TradeObject);
        // success(`Trade loaded successfully: '${Trade.UTI}'`);
        return Trade;
    }

    save(): void {
        let TradeObject = JSON.stringify<Trade>(this);
        Ledger.getTable(TradesTable).set(this.UTI, TradeObject);
        // success(`Trade saved successfully: ${this.UTI}`);
    }

    delete(): void {
        Ledger.getTable(TradesTable).unset(this.UTI);
        success(`Trade deleted successfully: ${this.UTI}`);
    }

    addPublicComments(role: RoleType, input: ActionTradeInput): void {
        this.tradePublicComments.push(new TradeComment(Context.get('sender'), role, Context.get("trusted_time"), input.metadata));
    }

    addPrivateComments(role: RoleType, input: ActionTradeInput): void {
        this.tradePrivateComments.push(new TradeComment(Context.get('sender'), role, Context.get("trusted_time"), input.metadata));
    }

    filterPrivateComments(role: RoleType): void {
        let tmp = new Array<TradeComment>();
        for (let i = 0; i < this.tradePrivateComments.length; i++) {
            if (this.tradePrivateComments[i].role != role) {
                tmp.push(this.tradePrivateComments[i]);
            }
        }
        this.tradePrivateComments = tmp;
    }

    addAuditLog(): void {
        this.auditHistory.push(new AuditLog(Context.get('sender'), Context.get("trusted_time")));
    }

    addMatchLog(roleType: RoleType, key: string, value: string): void {
        switch (roleType) {            
            case RoleType.SettlementAgent:            
                this.matchTradeDetails.push(new MatchLog(Context.get('sender'), Context.get("trusted_time"), key, value));
                break;
            case RoleType.ClearingHouse:
                this.matchMoneyTransfer.push(new MatchLog(Context.get('sender'), Context.get("trusted_time"), key, value));
                break;
            case RoleType.Custodian:
                this.matchAssetTransfer.push(new MatchLog(Context.get('sender'), Context.get("trusted_time"), key, value));
                break;
            default:
                error("Invalid role type");
        }        
    }

    exactMatch(key: string, value: string): boolean {
        let tradeInfo = this.tradeCreation[this.tradeCreation.length-1].info;
        switch (key) {
            case "buyerName":
                return tradeInfo.buyerName === value;
            case "buyerCountry":
                return tradeInfo.buyerCountry === value;
            case "sellerName":
                return tradeInfo.sellerName === value;
            case "sellerCountry":
                return tradeInfo.sellerCountry === value;
            case "asset":
                return tradeInfo.asset === value;
            case "quantity":
                return tradeInfo.quantity === value;
            case "price":
                return tradeInfo.price === value;
            case "tradeDate":
                return tradeInfo.tradeDate === value;
            case "jurisdiction":
                return tradeInfo.jurisdiction === value;
            default:
                error("Invalid key");
                return false;
        }        
    }

    levenshteinMatch(key: string, value: string): u64 {
        let tradeInfo = this.tradeCreation[this.tradeCreation.length-1].info;
        switch (key) {
            case "buyerName":
                return levenshtein(tradeInfo.buyerName, value);
            case "buyerCountry":
                return levenshtein(tradeInfo.buyerCountry, value);
            case "sellerName":
                return levenshtein(tradeInfo.sellerName, value);
            case "sellerCountry":
                return levenshtein(tradeInfo.sellerCountry, value);
            case "asset":
                return levenshtein(tradeInfo.asset, value);
            case "jurisdiction":
                return levenshtein(tradeInfo.jurisdiction, value);
            default:
                error(`Invalid key ${key}`);
                return -1;
        }        
    }

    boundaryMatch(key: string, min: amount, max: amount): boolean {
        let tradeInfo = this.tradeCreation[this.tradeCreation.length-1].info;
        switch (key) {
            case "quantity":
                return min < tradeInfo.quantity && tradeInfo.quantity < max;
            case "price":
                return min < tradeInfo.price && tradeInfo.price < max;
            case "tradeDate":
                return min < tradeInfo.tradeDate && tradeInfo.tradeDate < max;
            default:
                error("Invalid key");
                return false;
        }
    }

    processExactMatch(role: RoleType, key: string, value: string): boolean {
        if (this.exactMatch(key, value)) {
            this.addMatchLog(role, key, value);
            return true;
        }
        return false;
    }

    processBoundaryMatch(role: RoleType, key: string, min: amount, max: amount): boolean {
        if (this.boundaryMatch(key, min, max)) {
            this.addMatchLog(role, key, min.toString() + "< x <" + max.toString());
            return true;
        }
        return false;
    }

    processLevenshteinMatch(role: RoleType, key: string, value: string, distance: u64): boolean {
        if (this.levenshteinMatch(key, value) <= distance) {
            this.addMatchLog(role, key, value);
            return true;
        }
        return false;
    }

    verify_trade_token(now: string, storageServer_private_key: string) : boolean {        
        let token = b64decode(this.tokenB64);
        if (token.length != (40 + 64)) {
            error("Trade upload token size is invalid");
            return false;
        }

        let digestUTI = token.subarray(0, 32);
        let expectedDigestUTI = Crypto.SHA.digest("sha2-256", this.UTI);
        if (!expectedDigestUTI || expectedDigestUTI.byteLength != 32) {
            error("Expected Trade UTI digest size is invalid");
            return false;
        }
        if (digestUTI != expectedDigestUTI) {
            error("Trade upload token refers to the wrong Trade: " + digestUTI + " != vs expected " + expectedDigestUTI);
			return false;
        }

        // let token_time = token.subarray(32, 40);
        // Check the token has not expired
        // if (token_time.toString() > now) {
        //     error("Trade upload token has expired:" + token_time.toString() + " > " + now);
		// 	return false;
        // }

        let token_body = token.subarray(0, 40);
        let token_signature = token.subarray(40, 40+64);

        let storageServer_pkey = Crypto.ECDSA.getKey(storageServer_private_key);
        if (!storageServer_pkey) {
            error("Issue retrieving the key" + storageServer_private_key);
            return false;
        }
        let verified = storageServer_pkey.verify(b64encode(token_body), Crypto.Utils.convertToU8Array(token_signature));
        if(!verified) {
			error("Trade upload token signature is invalid: " + b64encode(token_signature) + ", " + b64encode(token_body));
			return false;            
        }
        return true;
    }

    generate_trade_token(now: string, klaveServer_private_key: string): Uint8Array {        
        let digestUTI = Crypto.SHA.digest("sha2-256", this.UTI);
        if (!digestUTI || digestUTI.byteLength != 32) {
            error("Trade UTI digest size is invalid");
            return new Uint8Array(0);
        }

        let token_body = new Uint8Array(40);
        token_body.set(Crypto.Utils.convertToUint8Array(digestUTI), 0);
        // This is where the time could go if expiration was needed.
        token_body.set(new Uint8Array(8), digestUTI.byteLength);

        let klaveServer_signing_key = Crypto.ECDSA.getKey(klaveServer_private_key);
        if (!klaveServer_signing_key) {
            error("Issue retrieving the key" + klaveServer_private_key);
            return new Uint8Array(0);
        }

        let token_signature = klaveServer_signing_key.sign(b64encode(token_body));
        let token = new Uint8Array(40 + 64);
        token.set(token_body, 0);
        token.set(Crypto.Utils.convertToUint8Array(token_signature), 40);
        return token;
    }
}