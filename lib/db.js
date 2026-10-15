import mongoose from 'mongoose';

let connection = globalThis.mongooseConnection;
if (!connection) connection = globalThis.mongooseConnection = { promise: null, connection: null };

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required. Configure it in your local environment.');
  if (connection.connection) return connection.connection;
  if (!connection.promise) {
    connection.promise = mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 5000 });
  }
  connection.connection = await connection.promise;
  return connection.connection;
}