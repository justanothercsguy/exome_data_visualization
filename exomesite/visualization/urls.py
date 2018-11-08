from django.urls import path

from . import views

urlpatterns = [
    # ex: /visualization/
    path('', views.index, name='index'),

    # ex: /visualization/1
    path('<int:id>/', views.query, name='query'),
]