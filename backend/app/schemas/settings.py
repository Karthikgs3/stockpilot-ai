from pydantic import BaseModel, field_validator

_ALLOWED_THEMES = {"light", "dark", "system"}
_ALLOWED_CURRENCIES = {"USD", "INR", "EUR", "GBP"}


class UserPreferencesUpdate(BaseModel):
    """
    Partial update for the two persisted preference columns on User.
    Timezone and notification preferences are intentionally not here —
    they have no backing columns and are handled client-side only.
    """

    theme: str | None = None
    currency: str | None = None

    @field_validator("theme")
    @classmethod
    def validate_theme(cls, v: str | None) -> str | None:
        if v is not None and v not in _ALLOWED_THEMES:
            raise ValueError(f"theme must be one of {sorted(_ALLOWED_THEMES)}")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str | None) -> str | None:
        if v is not None and v not in _ALLOWED_CURRENCIES:
            raise ValueError(f"currency must be one of {sorted(_ALLOWED_CURRENCIES)}")
        return v
