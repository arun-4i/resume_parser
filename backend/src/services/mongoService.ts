import { MongoClient, Db, Collection, MongoClientOptions } from "mongodb";
import { config } from "@config/env";
import { logger } from "@utils/logger";
import { AppError } from "@utils/error";
import {
  Topic,
  Query,
  Candidate,
  MongoConfig,
  MongoError,
  TopicValidationRequest,
  TopicValidationResult,
} from "@types/quizWorkflow";

export class MongoService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected: boolean = false;
  private readonly config: MongoConfig;

  constructor(connectionString?: string) {
    this.config = {
      connectionString: connectionString || config.MONGO_CONNECTION_STRING,
      dbName: "onlinetestinternal",
      collections: {
        topics: "topics",
        queries: "queries",
        candidates: "candidates",
      },
    };
  }

  async connect(): Promise<void> {
    try {
      if (this.isConnected && this.client && this.db) {
        logger.info("api", "MongoDB already connected, reusing connection");
        return;
      }

      logger.info("api", "Establishing MongoDB connection", {
        dbName: this.config.dbName,
        connectionString: this.config.connectionString.replace(
          /\/\/[^:]+:[^@]+@/,
          "//***:***@"
        ), // Mask credentials
      });

      const options: MongoClientOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        retryReads: true,
      };

      this.client = new MongoClient(this.config.connectionString, options);
      await this.client.connect();

      this.db = this.client.db(this.config.dbName);
      this.isConnected = true;

      // Test the connection
      await this.db.admin().ping();

      logger.info("api", "MongoDB connection established successfully", {
        dbName: this.config.dbName,
        collections: Object.keys(this.config.collections),
      });
    } catch (error) {
      this.isConnected = false;
      const mongoError: MongoError = {
        message:
          error instanceof Error
            ? error.message
            : "Unknown MongoDB connection error",
        operation: "connect",
      };

      logger.error("api", "MongoDB connection failed", {
        error: mongoError.message,
        dbName: this.config.dbName,
      });

      throw new AppError(
        `MongoDB connection failed: ${mongoError.message}`,
        500,
        "MONGODB_CONNECTION_ERROR",
        true,
        mongoError
      );
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.close();
        this.client = null;
        this.db = null;
        this.isConnected = false;

        logger.info("api", "MongoDB connection closed successfully");
      }
    } catch (error) {
      logger.error("api", "Error closing MongoDB connection", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected || !this.db) {
      await this.connect();
    }
  }

  private getCollection<T>(
    collectionName: keyof typeof this.config.collections
  ): Collection<T> {
    if (!this.db) {
      throw new AppError("MongoDB not connected", 500, "MONGODB_NOT_CONNECTED");
    }
    return this.db.collection<T>(this.config.collections[collectionName]);
  }

  async getExistingTopics(): Promise<Topic[]> {
    try {
      await this.ensureConnection();

      logger.info("api", "Fetching existing topics from MongoDB", {
        collection: this.config.collections.topics,
      });

      const topicsCollection = this.getCollection<Topic>("topics");

      const topics = await topicsCollection
        .find({ ACTIVE: "Y" })
        .sort({ TOPIC_NAME: 1 })
        .toArray();

      logger.info("api", "Successfully fetched existing topics", {
        topicsCount: topics.length,
        topicNames: topics.map((t) => t.TOPIC_NAME),
      });

      return topics;
    } catch (error) {
      const mongoError: MongoError = {
        message: error instanceof Error ? error.message : "Unknown error",
        collection: this.config.collections.topics,
        operation: "getExistingTopics",
        query: { ACTIVE: "Y" },
      };

      logger.error("api", "Error fetching existing topics", mongoError);

      throw new AppError(
        `Failed to fetch existing topics: ${mongoError.message}`,
        500,
        "MONGODB_QUERY_ERROR",
        true,
        mongoError
      );
    }
  }

  async findTopicById(topicId: string): Promise<Topic | null> {
    try {
      await this.ensureConnection();

      logger.info("api", "Finding topic by ID", {
        topicId,
        collection: this.config.collections.topics,
      });

      const topicsCollection = this.getCollection<Topic>("topics");

      const topic = await topicsCollection.findOne({
        TOPIC_ID: topicId,
        ACTIVE: "Y",
      });

      if (topic) {
        logger.info("api", "Topic found successfully", {
          topicId,
          topicName: topic.TOPIC_NAME,
        });
      } else {
        logger.warn("api", "Topic not found or inactive", { topicId });
      }

      return topic;
    } catch (error) {
      const mongoError: MongoError = {
        message: error instanceof Error ? error.message : "Unknown error",
        collection: this.config.collections.topics,
        operation: "findTopicById",
        query: { TOPIC_ID: topicId, ACTIVE: "Y" },
      };

      logger.error("api", "Error finding topic by ID", mongoError);

      throw new AppError(
        `Failed to find topic: ${mongoError.message}`,
        500,
        "MONGODB_QUERY_ERROR",
        true,
        mongoError
      );
    }
  }

  async validateTopicQuestions(
    topicId: string,
    queryType: string,
    marksPerQuery: number,
    requiredCount: number
  ): Promise<TopicValidationResult> {
    try {
      await this.ensureConnection();

      logger.info("api", "Validating topic questions availability", {
        topicId,
        queryType,
        marksPerQuery,
        requiredCount,
        collection: this.config.collections.queries,
      });

      const queriesCollection = this.getCollection<Query>("queries");

      const query = {
        TOPIC_ID: topicId,
        QUERY_TYPE: queryType,
        MARKS_PER_QUERY: marksPerQuery,
        ACTIVE: "Y",
      };

      const availableQueries = await queriesCollection.find(query).toArray();

      const availableCount = availableQueries.length;
      const isValid = availableCount >= requiredCount;

      const result: TopicValidationResult = {
        isValid,
        availableCount,
        requiredCount,
        queries: isValid ? availableQueries : undefined,
      };

      logger.info("api", "Topic questions validation completed", {
        topicId,
        queryType,
        marksPerQuery,
        availableCount,
        requiredCount,
        isValid,
      });

      if (!isValid) {
        logger.warn("api", "Insufficient questions available for topic", {
          topicId,
          queryType,
          marksPerQuery,
          availableCount,
          requiredCount,
          shortage: requiredCount - availableCount,
        });
      }

      return result;
    } catch (error) {
      const mongoError: MongoError = {
        message: error instanceof Error ? error.message : "Unknown error",
        collection: this.config.collections.queries,
        operation: "validateTopicQuestions",
        query: { topicId, queryType, marksPerQuery, requiredCount },
      };

      logger.error("api", "Error validating topic questions", mongoError);

      throw new AppError(
        `Failed to validate topic questions: ${mongoError.message}`,
        500,
        "MONGODB_QUERY_ERROR",
        true,
        mongoError
      );
    }
  }

  async validateMultipleTopics(
    requests: TopicValidationRequest[]
  ): Promise<TopicValidationResult[]> {
    try {
      logger.info("api", "Validating multiple topics", {
        requestsCount: requests.length,
        topics: requests.map((r) => ({
          topicId: r.topicId,
          queryType: r.queryType,
        })),
      });

      const validationPromises = requests.map((request) =>
        this.validateTopicQuestions(
          request.topicId,
          request.queryType,
          request.marksPerQuery,
          request.requiredCount
        )
      );

      const results = await Promise.all(validationPromises);

      const failedValidations = results.filter((r) => !r.isValid);

      logger.info("api", "Multiple topic validation completed", {
        totalRequests: requests.length,
        successfulValidations: results.length - failedValidations.length,
        failedValidations: failedValidations.length,
      });

      if (failedValidations.length > 0) {
        logger.warn("api", "Some topic validations failed", {
          failedCount: failedValidations.length,
          failures: failedValidations.map((result, index) => ({
            request: requests[results.indexOf(result)],
            availableCount: result.availableCount,
            requiredCount: result.requiredCount,
          })),
        });
      }

      return results;
    } catch (error) {
      logger.error("api", "Error in multiple topic validation", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestsCount: requests.length,
      });
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureConnection();

      if (!this.db) {
        return false;
      }

      // Simple ping to check connection
      await this.db.admin().ping();

      logger.info("api", "MongoDB health check passed");
      return true;
    } catch (error) {
      logger.error("api", "MongoDB health check failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  // Get service configuration
  getConfiguration(): MongoConfig {
    return {
      ...this.config,
      connectionString: this.config.connectionString.replace(
        /\/\/[^:]+:[^@]+@/,
        "//***:***@"
      ), // Mask credentials
    };
  }

  // Get connection status
  isConnectionActive(): boolean {
    return this.isConnected && !!this.client && !!this.db;
  }
}

// Export singleton instance
export const mongoService = new MongoService();
