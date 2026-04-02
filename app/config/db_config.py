import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "postgres": os.getenv("POSTGRES_URL"),
    "mysql": os.getenv("MYSQL_URL"),
    "snowflake": os.getenv("SNOWFLAKE_URL")
}