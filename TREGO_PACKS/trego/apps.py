from django.apps import AppConfig

class TregoConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'trego'

    def ready(self):
        import trego.signals
