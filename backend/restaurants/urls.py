from django.urls import path
from .views import TableMenuView

urlpatterns = [
    path('table/<uuid:qr_token>/', TableMenuView.as_view(), name='table-menu'),
]