package com.medicare.util;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

/**
 * Singleton utility that owns the MongoDB connection lifecycle (documented in the
 * project plan as util/MongoConnection.java).
 *
 * The connection string is read ONCE from the MONGO_URI environment variable.
 * It is never hardcoded and never committed to the repository.
 */
public final class MongoConnection {

    private static volatile MongoConnection instance;

    private final MongoClient client;
    private final String databaseName;

    private MongoConnection() {
        String uri = System.getenv("MONGO_URI");
        if (uri == null || uri.isBlank()) {
            throw new IllegalStateException(
                    "Environment variable MONGO_URI is not set. "
                  + "Export it, e.g. MONGO_URI=\"mongodb+srv://user:pass@cluster.mongodb.net/medicare\"");
        }

        // Optional override of the database name inside the URI (defaults to "medicare").
        String dbNameOverride = System.getenv("MEDICARE_DB_NAME");

        ConnectionString connectionString = new ConnectionString(uri);
        String uriDb = connectionString.getDatabase();
        this.databaseName = (dbNameOverride != null && !dbNameOverride.isBlank())
                ? dbNameOverride
                : (uriDb != null && !uriDb.isBlank() ? uriDb : "medicare");

        this.client = MongoClients.create(MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .applicationName("MediCare")
                .build());

        Runtime.getRuntime().addShutdownHook(new Thread(client::close));
    }

    public static MongoConnection getInstance() {
        if (instance == null) {
            synchronized (MongoConnection.class) {
                if (instance == null) {
                    instance = new MongoConnection();
                }
            }
        }
        return instance;
    }

    /** Returns the application database handle. */
    public MongoDatabase getDatabase() {
        return client.getDatabase(databaseName);
    }

    public String getDatabaseName() {
        return databaseName;
    }
}
