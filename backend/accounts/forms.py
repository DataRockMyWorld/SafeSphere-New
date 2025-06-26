from django.contrib.auth import get_user_model
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms


User = get_user_model()

class CustomUserCreationForm(UserCreationForm):
    password1 = forms.CharField(required=False, widget=forms.PasswordInput)
    password2 = forms.CharField(required=False, widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'phone_number', 'department', 'role', 'position')


class CustomUserChangeForm(UserChangeForm):
    password = None  # Remove the password field from the form

    class Meta:
        model = User
        fields = (
            'email', 'first_name', 'last_name', 'phone_number', 
            'department', 'role', 'position', 'is_active', 'is_staff', 'is_superuser'
        )
        readonly_fields = ('email',)  # Make email readonly to prevent changes
