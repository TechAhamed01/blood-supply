import os
from pathlib import Path
from datetime import timedelta

# -------------------------------------------------
# BASE DIRECTORY
# -------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent.parent


# -------------------------------------------------
# SECURITY
# -------------------------------------------------
SECRET_KEY = "django-insecure-change-this-key"

DEBUG = True

ALLOWED_HOSTS = []


# -------------------------------------------------
# DJANGO CORE APPS
# -------------------------------------------------
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]


# -------------------------------------------------
# THIRD PARTY APPS
# -------------------------------------------------
THIRD_PARTY_APPS = [
    "rest_framework",
    "corsheaders",
]


# -------------------------------------------------
# LOCAL APPS
# -------------------------------------------------
LOCAL_APPS = [
    "apps.users.apps.UsersConfig",
    "apps.hospitals.apps.HospitalsConfig",
    "apps.bloodbanks.apps.BloodbanksConfig",
    "apps.inventory.apps.InventoryConfig",
    "apps.allocation.apps.AllocationConfig",
    "apps.ai_engine.apps.AiEngineConfig",
    
    
]


INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

BLOOD_GROUPS = [
    "A+","A-",
    "B+","B-",
    "AB+","AB-",
    "O+","O-"
]
# -------------------------------------------------
# MIDDLEWARE
# -------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "bloodsupply.urls"


# -------------------------------------------------
# TEMPLATES
# -------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "bloodsupply.wsgi.application"


# -------------------------------------------------
# DATABASE (DEV = SQLITE)
# -------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Production later → PostgreSQL


# -------------------------------------------------
# PASSWORD VALIDATION
# -------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
]


# -------------------------------------------------
# INTERNATIONALIZATION
# -------------------------------------------------
LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True


# -------------------------------------------------
# STATIC FILES
# -------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"


# -------------------------------------------------
# MEDIA FILES
# -------------------------------------------------
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# -------------------------------------------------
# ML MODELS DIRECTORY
# -------------------------------------------------
ML_MODELS_DIR = os.path.join(BASE_DIR, "media", "ml_models")
os.makedirs(ML_MODELS_DIR, exist_ok=True)


# -------------------------------------------------
# DEFAULT PRIMARY KEY
# -------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# -------------------------------------------------
# CUSTOM USER MODEL
# -------------------------------------------------
AUTH_USER_MODEL = "users.User"


# -------------------------------------------------
# DJANGO REST FRAMEWORK
# -------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}


# -------------------------------------------------
# JWT CONFIGURATION
# -------------------------------------------------
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=6),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# -------------------------------------------------
# CORS (React frontend connect panna)
# -------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True


DATASETS_DIR = os.path.join(BASE_DIR, "datasets")