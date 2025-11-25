from django.apps import AppConfig


class AuthentificationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentification'

    def ready(self):
        """Import signals when app is ready."""
        import authentification.signals  # noqa
