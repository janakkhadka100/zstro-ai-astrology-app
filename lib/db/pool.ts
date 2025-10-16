// lib/db/pool.ts
// Database connection pooling configuration

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { logger } from '../services/logger';
import envConfig from '../config/env';

interface PoolConfig {
  max: number;
  min: number;
  idle: number;
  acquire: number;
  evict: number;
  handleDisconnects: boolean;
}

class DatabasePool {
  private primaryConnection: postgres.Sql | null = null;
  private replicaConnection: postgres.Sql | null = null;
  private config: PoolConfig;
  private isConnected = false;

  constructor() {
    this.config = {
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      min: parseInt(process.env.DB_POOL_MIN || '5'),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000'),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
      evict: parseInt(process.env.DB_POOL_EVICT || '1000'),
      handleDisconnects: true,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Initialize primary connection
      this.primaryConnection = postgres(envConfig.POSTGRES_URL, {
        max: this.config.max,
        min: this.config.min,
        idle_timeout: this.config.idle,
        connect_timeout: this.config.acquire,
        max_lifetime: 60 * 30, // 30 minutes
        onnotice: (notice) => {
          logger.debug('PostgreSQL notice:', notice);
        },
        onparameter: (key, value) => {
          logger.debug(`PostgreSQL parameter: ${key} = ${value}`);
        },
        onclose: () => {
          logger.warn('PostgreSQL connection closed');
          this.isConnected = false;
        },
        onerror: (error) => {
          logger.error('PostgreSQL connection error:', error);
          this.isConnected = false;
        },
      });

      // Test primary connection
      await this.primaryConnection`SELECT 1`;
      this.isConnected = true;
      logger.info('Primary database connection established');

      // Initialize replica connection if available
      if (envConfig.DB_REPLICA_URL) {
        this.replicaConnection = postgres(envConfig.DB_REPLICA_URL, {
          max: Math.floor(this.config.max / 2), // Use fewer connections for replica
          min: Math.floor(this.config.min / 2),
          idle_timeout: this.config.idle,
          connect_timeout: this.config.acquire,
          max_lifetime: 60 * 30,
          onnotice: (notice) => {
            logger.debug('PostgreSQL replica notice:', notice);
          },
          onparameter: (key, value) => {
            logger.debug(`PostgreSQL replica parameter: ${key} = ${value}`);
          },
          onclose: () => {
            logger.warn('PostgreSQL replica connection closed');
          },
          onerror: (error) => {
            logger.error('PostgreSQL replica connection error:', error);
          },
        });

        // Test replica connection
        await this.replicaConnection`SELECT 1`;
        logger.info('Replica database connection established');
      }

    } catch (error) {
      logger.error('Failed to initialize database pool:', error);
      throw error;
    }
  }

  getPrimaryConnection(): postgres.Sql {
    if (!this.primaryConnection) {
      throw new Error('Primary database connection not initialized');
    }
    return this.primaryConnection;
  }

  getReplicaConnection(): postgres.Sql {
    if (!this.replicaConnection) {
      logger.warn('Replica connection not available, using primary');
      return this.getPrimaryConnection();
    }
    return this.replicaConnection;
  }

  getConnection(preferReplica: boolean = false): postgres.Sql {
    if (preferReplica && envConfig.READ_PREFER_REPLICA) {
      return this.getReplicaConnection();
    }
    return this.getPrimaryConnection();
  }

  async healthCheck(): Promise<{
    primary: boolean;
    replica: boolean;
    isConnected: boolean;
  }> {
    const health = {
      primary: false,
      replica: false,
      isConnected: this.isConnected,
    };

    try {
      // Check primary connection
      if (this.primaryConnection) {
        await this.primaryConnection`SELECT 1`;
        health.primary = true;
      }
    } catch (error) {
      logger.error('Primary database health check failed:', error);
      health.primary = false;
    }

    try {
      // Check replica connection
      if (this.replicaConnection) {
        await this.replicaConnection`SELECT 1`;
        health.replica = true;
      }
    } catch (error) {
      logger.error('Replica database health check failed:', error);
      health.replica = false;
    }

    return health;
  }

  async close(): Promise<void> {
    try {
      if (this.primaryConnection) {
        await this.primaryConnection.end();
        this.primaryConnection = null;
        logger.info('Primary database connection closed');
      }

      if (this.replicaConnection) {
        await this.replicaConnection.end();
        this.replicaConnection = null;
        logger.info('Replica database connection closed');
      }

      this.isConnected = false;
    } catch (error) {
      logger.error('Error closing database connections:', error);
    }
  }

  getStats(): {
    config: PoolConfig;
    isConnected: boolean;
    hasReplica: boolean;
  } {
    return {
      config: this.config,
      isConnected: this.isConnected,
      hasReplica: this.replicaConnection !== null,
    };
  }
}

// Singleton instance
export const dbPool = new DatabasePool();

// Initialize on module load
if (process.env.NODE_ENV !== 'test') {
  dbPool.initialize().catch((error) => {
    logger.error('Failed to initialize database pool on startup:', error);
  });
}

export default dbPool;
