from django.urls import path

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
    path('<str:gene_name2>/', views.result, name='result'),
]