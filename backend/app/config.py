from functools import lru_cache
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    azure_openai_endpoint: Optional[str] = Field(None, alias="AZURE_OPENAI_ENDPOINT")
    azure_openai_api_key: Optional[str] = Field(None, alias="AZURE_OPENAI_API_KEY")
    azure_openai_api_version: str = Field("preview", alias="AZURE_OPENAI_API_VERSION")
    azure_openai_deployment: str = Field("sora", alias="AZURE_OPENAI_DEPLOYMENT")
    # For video generation quickstart, the model is specified in the request body
    azure_openai_model: str = Field("sora", alias="AZURE_OPENAI_MODEL")
    storage_dir: Path = Field(Path("./storage"), alias="STORAGE_DIR")
    base_url: str = Field("http://localhost:8090", alias="BASE_URL")
    use_managed_identity: bool = Field(False, alias="AZURE_USE_MANAGED_IDENTITY")

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    s = Settings()
    s.storage_dir.mkdir(parents=True, exist_ok=True)
    return s

settings = get_settings()
