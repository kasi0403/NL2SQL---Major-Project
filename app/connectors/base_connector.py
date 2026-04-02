# This ensures every database connector has the same methods.
from abc import ABC, abstractmethod

class DatabaseConnector(ABC):
    
    @abstractmethod
    def test_connection(self):
        pass

    @abstractmethod
    def get_schema(self):
        pass

    @abstractmethod
    def execute_query(self, query: str):
        pass