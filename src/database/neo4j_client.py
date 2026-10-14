import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

class Neo4jManager:
    def __init__(self):
        uri = os.environ.get("NEO4J_URI", "")
        user = os.environ.get("NEO4J_USERNAME", "neo4j")
        password = os.environ.get("NEO4J_PASSWORD", "")
        
        if not uri or not password:
            raise ValueError("NEO4J_URI and NEO4J_PASSWORD must be provided.")
            
        self.driver = GraphDatabase.driver(
            uri, 
            auth=(user, password),
            max_connection_lifetime=200, # Aura drops at ~300s
            connection_timeout=3.0,
            max_transaction_retry_time=2.0,
            keep_alive=True,
            max_connection_pool_size=50
        )

    def close(self):
        self.driver.close()

    def get_session(self):
        return self.driver.session()

neo4j_manager = Neo4jManager()
