from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """Register a new user and return JWT tokens."""
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")

    errors = {}
    if not username:
        errors["username"] = "Ce champ est requis."
    elif User.objects.filter(username=username).exists():
        errors["username"] = "Ce nom d'utilisateur est déjà pris."

    if not email:
        errors["email"] = "Ce champ est requis."
    elif User.objects.filter(email=email).exists():
        errors["email"] = "Cet email est déjà utilisé."

    if not password:
        errors["password"] = "Ce champ est requis."
    else:
        try:
            validate_password(password)
        except ValidationError as e:
            errors["password"] = list(e.messages)

    if errors:
        return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """Return current user profile."""
    user = request.user
    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "date_joined": user.date_joined.isoformat(),
        }
    )
