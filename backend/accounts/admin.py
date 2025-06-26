from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .models import User
from .forms import CustomUserCreationForm, CustomUserChangeForm

CustomUser = get_user_model()

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = [
        "id",
        "email",
        "first_name",
        "last_name",
        "phone_number",
        "department",
        "position",
        "is_active",
        "is_superuser",
        "role",
    ]
    ordering = ["email"]
    search_fields = ["email", "first_name", "last_name", "phone_number"]
    actions = ['resend_password_reset']  # Add resend password reset action
    list_filter = ('role', 'department', 'position', 'is_active', 'is_staff')
    readonly_fields = ('date_joined', 'last_login')

    fieldsets = (
        (None, {"fields": ("email",)}),
        ("Personal info", {"fields": ("first_name", "last_name", "phone_number")}),
        ("Role & Department", {"fields": ("role", "department", "position")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "phone_number", "role", "department", "position"),
            "description": "Password will be auto-generated and sent to the user's email."
        }),
    )

    def get_actions(self, request):
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']
        return actions

    def resend_password_reset(self, request, queryset):
        """Resend password reset email to selected users."""
        success_count = 0
        for user in queryset:
            try:
                user.send_verification_email()
                success_count += 1
            except Exception as e:
                self.message_user(request, f"Failed to send password reset email to {user.email}: {str(e)}", level='ERROR')
        
        if success_count == 1:
            self.message_user(request, f"Password reset email sent to {success_count} user.")
        else:
            self.message_user(request, f"Password reset emails sent to {success_count} users.")
    
    resend_password_reset.short_description = "Resend password reset email"

    def save_model(self, request, obj, form, change):
        if not change:  # When creating a new user
            if not obj.is_superuser:  # Only generate password for non-superusers
                # Use the UserManager.create_user method to properly handle password generation and email sending
                try:
                    user = User.objects.create_user(
                        email=obj.email,
                        first_name=obj.first_name,
                        last_name=obj.last_name,
                        phone_number=obj.phone_number,
                        role=obj.role,
                        department=obj.department,
                        position=obj.position,
                        is_active=obj.is_active,
                        is_staff=obj.is_staff,
                        is_superuser=obj.is_superuser
                    )
                    # Update the obj reference to the created user
                    obj.pk = user.pk
                    obj.id = user.id
                    self.message_user(request, f"User {obj.email} created successfully. Password reset email has been sent.")
                except Exception as e:
                    self.message_user(request, f"Failed to create user: {str(e)}", level='ERROR')
                    return
            else:
                # For superusers, we'll use a default password that they must change
                password = self.model.objects.make_random_password()
                obj.set_password(password)
                obj.save()
                
                # Send verification email for superusers too
                try:
                    obj.send_verification_email()
                    self.message_user(request, f"Superuser {obj.email} created successfully. Password reset email has been sent.")
                except Exception as e:
                    self.message_user(request, f"Failed to send password reset email: {str(e)}", level='ERROR')
        else:
            super().save_model(request, obj, form, change)



