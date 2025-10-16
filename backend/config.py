import os

class Settings:
    FLASK_ENV: str = os.getenv("FLASK_ENV", "production")
    PORT: int = int(os.getenv("PORT", "8000"))
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "*")

    GEOSERVER_URL: str = os.getenv("GEOSERVER_URL", "http://localhost:8080/geoserver")
    GEOSERVER_USER: str = os.getenv("GEOSERVER_USER", "admin")
    GEOSERVER_PASS: str = os.getenv("GEOSERVER_PASS", "geoserver")
    GEOSERVER_DEFAULT_WORKSPACE: str = os.getenv("GEOSERVER_DEFAULT_WORKSPACE", "")
    GEOSERVER_DEFAULT_SRS: str = os.getenv("GEOSERVER_DEFAULT_SRS", "EPSG:4326")

    REQUEST_TIMEOUT_SECONDS: int = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "15"))

settings = Settings()
