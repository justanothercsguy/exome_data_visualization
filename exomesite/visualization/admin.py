from django.contrib import admin

from .models import Gene, Variant

admin.site.register(Gene)
admin.site.register(Variant)