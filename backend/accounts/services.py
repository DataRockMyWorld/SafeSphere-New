from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

logger = logging.getLogger(__name__)

def send_password_reset_email(user, reset_url):
    """Send password reset email with HTML template."""
    try:
        html_message = render_to_string('accounts/email/password_reset.html', {
            'user': user,
            'reset_url': reset_url
        })
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject="Set Your Password - SafeSphere",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Password reset email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send password reset email: {str(e)}")
        raise

def send_password_change_notification(user):
    """Send password change notification email."""
    try:
        html_message = render_to_string('accounts/email/password_changed.html', {
            'user': user
        })
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject="Password Changed - SafeSphere",
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Password change notification sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send password change notification: {str(e)}")
        raise

def send_sms(to_number, message):
    """Send SMS using Twilio."""
    if not all([settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN, settings.TWILIO_PHONE_NUMBER]):
        logger.warning("Twilio credentials not configured. Skipping SMS notification.")
        return False
        
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_number
        )
        logger.info(f"SMS sent successfully to {to_number}")
        return True
    except TwilioRestException as e:
        logger.error(f"Failed to send SMS to {to_number}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error sending SMS to {to_number}: {str(e)}")
        return False

def send_password_reset_notification(user, reset_url):
    """
    Send both email and SMS notifications for password reset
    """
    # Send email
    subject = "Password Reset Request"
    message = (
        f"Hello {user.first_name},\n\n"
        f"Please reset your password by clicking the link below:\n\n"
        f"{reset_url}\n\n"
        f"If you did not request this, please ignore this message.\n\n"
        f"Thank you."
    )
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Password reset email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
        raise
    
    # Send SMS (optional)
    sms_message = (
        f"SafeSphere: Password reset requested. "
        f"Click here to reset: {reset_url} "
        f"If you didn't request this, please ignore."
    )
    send_sms(user.phone_number, sms_message)  # SMS failure won't raise an exception 