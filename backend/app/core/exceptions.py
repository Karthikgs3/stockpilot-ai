class AppError(Exception):
    """Base class for all handled application errors."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class EmailAlreadyExistsError(AppError):
    def __init__(self):
        super().__init__("An account with this email already exists.")


class InvalidCredentialsError(AppError):
    def __init__(self):
        super().__init__("Incorrect email or password.")


class InvalidTokenError(AppError):
    def __init__(self):
        super().__init__("Invalid or expired token.")


class UserNotFoundError(AppError):
    def __init__(self):
        super().__init__("User not found.")


class InactiveUserError(AppError):
    def __init__(self):
        super().__init__("This account has been deactivated.")


class WatchlistItemNotFoundError(AppError):
    def __init__(self):
        super().__init__("Watchlist item not found.")


class WatchlistItemAlreadyExistsError(AppError):
    def __init__(self, symbol: str):
        super().__init__(f"{symbol} is already on your watchlist.")
