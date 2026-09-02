import * as axios from 'axios';
import { AxiosInstance } from 'axios';

declare class AuthModule {
    private client;
    constructor(client: CharisClient);
    /**
     * Logs a user in through the Control Center SSO.
     */
    login(email: string, password: string): Promise<any>;
    /**
     * Registers a new tenant and user.
     */
    register(tenantName: string, email: string, password: string, ownerName: string, mobileNo?: string): Promise<any>;
    /**
     * Verifies a JWT token with the Control Center.
     */
    verifyToken(token: string): Promise<any>;
}

declare class CharisRegistry {
    private client;
    constructor(client: AxiosInstance);
    register(): Promise<axios.AxiosResponse<any, any, {}, any>>;
    startHeartbeat(intervalMs?: number): void;
}

declare class CharisAI {
    private client;
    constructor(client: AxiosInstance);
    ask(prompt: string, context?: any): Promise<axios.AxiosResponse<any, {
        prompt: string;
        context: any;
    }, {}, any>>;
}

declare class CharisLogger {
    private client;
    constructor(client: AxiosInstance);
    info(message: string, meta?: any): void;
    error(message: string, error?: any): void;
    private shipLog;
}

declare class CharisFeatureFlags {
    private client;
    private flags;
    constructor(client: AxiosInstance);
    fetchFlags(): Promise<void>;
    isEnabled(flagName: string): boolean;
}

declare class CharisNotifications {
    private client;
    constructor(client: AxiosInstance);
    send(userId: string, template: string, payload: any): Promise<axios.AxiosResponse<any, {
        userId: string;
        template: string;
        payload: any;
    }, {}, any>>;
}

declare class CharisMonitoring {
    attachExpress(app: any): void;
}

interface EntitlementPayload {
    entitlementVersion: 1;
    applicationId: string;
    tenantId: string;
    status: string;
    planId: string | null;
    features: string[];
    limits: Record<string, number>;
    billingCycle: string | null;
    iat: number;
    exp: number;
}
interface CacheLayer {
    get(key: string): Promise<EntitlementPayload | null> | EntitlementPayload | null;
    set(key: string, value: EntitlementPayload): Promise<void> | void;
    delete?(key: string): Promise<void> | void;
}
declare class InMemoryCache implements CacheLayer {
    private cache;
    get(key: string): EntitlementPayload | null;
    set(key: string, value: EntitlementPayload): void;
    delete(key: string): void;
}
/** Verifies and caches app-scoped, signed entitlements. `exp` is Unix seconds. */
declare class EntitlementManager {
    private readonly applicationId;
    private readonly publicKey;
    private readonly webhookSecret;
    readonly http?: any | undefined;
    private readonly cache;
    readonly gracePeriodMs: number;
    private readonly processedEvents;
    private readonly replayWindowMs;
    constructor(applicationId: string, publicKey: string, webhookSecret: string, http?: any | undefined, cache?: CacheLayer, gracePeriodMs?: number);
    private key;
    verifyToken(token: string): EntitlementPayload;
    cacheEntitlement(tenantId: string, payload: EntitlementPayload): Promise<void>;
    getEntitlement(tenantId: string): Promise<EntitlementPayload | null>;
    fetchEntitlement(tenantId: string): Promise<EntitlementPayload>;
    requireFeature(feature: string): (req: any, res: any, next: any) => Promise<any>;
    requirePlan(plan: string): (req: any, res: any, next: any) => Promise<any>;
    checkLimit(limit: string, amount: number): (req: any, res: any, next: any) => Promise<any>;
    private authorize;
    webhookReceiver(): (req: any, res: any) => Promise<any>;
}

interface CharisSDKConfig {
    productId: string;
    apiKey: string;
    environment?: string;
    gatewayUrl?: string;
    /** Immutable Control Centre Application UUID. */
    applicationId?: string;
    publicKey?: string;
    webhookSecret?: string;
}
declare class CharisClient {
    auth: AuthModule;
    registry: CharisRegistry;
    ai: CharisAI;
    logger: CharisLogger;
    featureFlags: CharisFeatureFlags;
    notifications: CharisNotifications;
    monitoring: CharisMonitoring;
    entitlements: EntitlementManager;
    http: AxiosInstance;
    productId: string;
    private initialized;
    init(config: CharisSDKConfig): void;
}
declare const CharisSDK: CharisClient;

export { type CacheLayer, CharisClient, CharisSDK, type CharisSDKConfig, EntitlementManager, type EntitlementPayload, InMemoryCache };
