from django.contrib import admin
from .models import (
    LawCategory, LawResource, LawResourceChange,
    LegalRegisterEntry, LegalRegisterComment, LegalRegisterDocument, Position, LegislationTracker
)

# Register your models here.
admin.site.register(LawCategory)
admin.site.register(LawResource)
admin.site.register(LawResourceChange)
admin.site.register(LegalRegisterEntry)
admin.site.register(LegalRegisterComment)
admin.site.register(LegalRegisterDocument)
admin.site.register(Position)
admin.site.register(LegislationTracker)
