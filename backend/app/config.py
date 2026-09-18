import os
import yaml
from pathlib import Path
from pydantic import BaseModel, ConfigDict
from pydantic_settings import BaseSettings

class AppSettings(BaseModel):
    name: str = "PS 26152 Sovereign Analytics API"
    environment: str = "development"
    log_level: str = "INFO"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: list[str] = ["*"]
    secret_key: str = "sih-2026-ntro-sovereign-intelligence-secret-key"

class DatabaseSettings(BaseModel):
    url: str = "sqlite+aiosqlite:///./social_analytics.db"
    pool_size: int = 20

class RedisSettings(BaseModel):
    url: str = "redis://localhost:6379/0"

class AdapterConfig(BaseModel):
    enabled: bool = True
    provider: str = "synthetic"
    search_query: str = "(NTRO OR cyber OR security OR hackathon)"
    rate_limit_rpm: int = 300
    synthetic_ratio: float = 1.0

class AdaptersSettings(BaseModel):
    x: AdapterConfig = AdapterConfig()
    telegram: AdapterConfig = AdapterConfig()

class SentimentSettings(BaseModel):
    model_name: str = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
    version: str = "v3.1 (ONNX)"

class TrendsSettings(BaseModel):
    half_life_hours: float = 6.0
    min_volume: int = 10

class NetworkSettings(BaseModel):
    window_hours: int = 24
    pagerank_damping: float = 0.85

class DemographicsSettings(BaseModel):
    method_version: str = "heuristic-v1"

class Settings(BaseSettings):
    model_config = ConfigDict(extra="ignore")

    app: AppSettings = AppSettings()
    database: DatabaseSettings = DatabaseSettings()
    redis: RedisSettings = RedisSettings()
    adapters: AdaptersSettings = AdaptersSettings()
    sentiment: SentimentSettings = SentimentSettings()
    trends: TrendsSettings = TrendsSettings()
    network: NetworkSettings = NetworkSettings()
    demographics: DemographicsSettings = DemographicsSettings()

def load_settings() -> Settings:
    config_path = Path(os.getenv("CONFIG_PATH", "config.yaml"))
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
            return Settings(**data)
    return Settings()

settings = load_settings()
