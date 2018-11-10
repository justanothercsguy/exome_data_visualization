from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

app_name = 'visualization'
urlpatterns = [
    # ex: /visualization/
    path('', views.index, name='index'),

    # ex: /visualization/search
    # The path for search must be put before the path for result,
    # otherwise '<str:gene_name2>/' mistakes 'search' as the name of a gene
    path('search/', views.search, name='search_gene'),
    
    # ex: /visualization/PCSK9
    path('<str:gene_name2>/', views.result, name='result')
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Serving static files during development (not deployment)
# https://docs.djangoproject.com/en/2.0/howto/static-files/