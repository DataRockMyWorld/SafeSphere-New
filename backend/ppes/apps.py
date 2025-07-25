from django.apps import AppConfig


class PpesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ppes'

    def ready(self):
        import ppes.signals
