from django.urls import path

from . import views

app_name = 'visualization'
urlpatterns = [
    # ex: /visualization/
    path('', views.index, name='index'),

    # ex: /visualization/PCSK9
    path('<str:gene_name2>/', views.result, name='result'),
]