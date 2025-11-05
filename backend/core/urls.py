"""
URL configuration for core project.


"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.documentation import include_docs_urls
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from accounts.views import (
    LoginUserView, LogoutUserView, PasswordResetConfirmView
)
from rest_framework_simplejwt.views import TokenRefreshView
schema_view = get_schema_view(
    openapi.Info(
        title="SafeSphere API",
        default_version='v1',
        description="API documentation for SafeSphere",
        terms_of_service="https://www.safesphere.com/terms/",
        contact=openapi.Contact(email="contact@safesphere.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin URLs
    path('admin/', admin.site.urls),
    
    # API URLs (includes auth endpoints from accounts.urls)
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/', include('api.urls')),
    
    # Token refresh (different prefix)
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Documentation
    path('api/v1/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/v1/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
