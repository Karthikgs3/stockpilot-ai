# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session

# from app.api.deps import get_current_user
# from app.core.exceptions import (
#     EmailAlreadyExistsError,
#     InactiveUserError,
#     InvalidCredentialsError,
#     InvalidTokenError,
#     UserNotFoundError,
# )
# from app.db.session import get_db
# from app.models.user import User
# from app.schemas.user import RefreshTokenRequest, Token, UserCreate, UserLogin, UserResponse
# from app.services.auth_service import AuthService

# router = APIRouter(prefix="/auth", tags=["Authentication"])


# @router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
# def signup(payload: UserCreate, db: Session = Depends(get_db)) -> Token:
#     """Create a new account and return an access/refresh token pair."""
#     try:
#         return AuthService(db).signup(payload)
#     except EmailAlreadyExistsError as e:
#         raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)


# @router.post("/login", response_model=Token)
# def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
#     """Authenticate with email/password and return an access/refresh token pair."""
#     try:
#         return AuthService(db).login(payload)
#     except InvalidCredentialsError as e:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)
#     except InactiveUserError as e:
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)


# @router.post("/refresh", response_model=Token)
# def refresh(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> Token:
#     """Exchange a valid refresh token for a new access/refresh token pair."""
#     try:
#         return AuthService(db).refresh(payload.refresh_token)
#     except (InvalidTokenError, UserNotFoundError) as e:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.message)


# @router.get("/me", response_model=UserResponse)
# def get_me(current_user: User = Depends(get_current_user)) -> User:
#     """Return the currently authenticated user's profile."""
#     return current_user



import traceback

from app.api.deps import get_current_user
from app.core.exceptions import (EmailAlreadyExistsError, InactiveUserError,
                                 InvalidCredentialsError, InvalidTokenError,
                                 UserNotFoundError)
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import (RefreshTokenRequest, Token, UserCreate,
                              UserLogin, UserResponse)
from app.services.auth_service import AuthService
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)) -> Token:
    print(">>> SIGNUP ROUTE HIT <<<")
    """Create a new account and return an access/refresh token pair."""
    try:
        return AuthService(db).signup(payload)

    except EmailAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=e.message,
        )

    except Exception as e:
        print("\n" + "=" * 80)
        print("SIGNUP ERROR")
        print("=" * 80)
        traceback.print_exc()
        print("=" * 80 + "\n")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    """Authenticate with email/password and return an access/refresh token pair."""
    try:
        return AuthService(db).login(payload)

    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
        )

    except InactiveUserError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=e.message,
        )

    except Exception as e:
        print("\n" + "=" * 80)
        print("LOGIN ERROR")
        print("=" * 80)
        traceback.print_exc()
        print("=" * 80 + "\n")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/refresh", response_model=Token)
def refresh(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> Token:
    """Exchange a valid refresh token for a new access/refresh token pair."""
    try:
        return AuthService(db).refresh(payload.refresh_token)

    except (InvalidTokenError, UserNotFoundError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
        )

    except Exception as e:
        print("\n" + "=" * 80)
        print("REFRESH TOKEN ERROR")
        print("=" * 80)
        traceback.print_exc()
        print("=" * 80 + "\n")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Return the currently authenticated user's profile."""
    return current_user