#!/bin/sh
# wait-for-db.sh

set -e

host="$1"
shift
cmd="$@"

# Use env vars if not passed
DB_USER=${POSTGRES_USER:-antoniocaballes}
DB_PASS=${POSTGRES_PASSWORD:-root}
DB_NAME=${POSTGRES_DB:-nest}

echo "Waiting for database at $host..."

until PGPASSWORD=$DB_PASS psql -h "$host" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo "Database not ready yet, retrying..."
  sleep 2
done

echo "Database is ready! Running command: $cmd"
exec $cmd
