from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', views.register_view, name='signup'),
    path('signin/', views.MyTokenObtainPairView.as_view(), name='signin'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('me/', views.me_view, name='me'),
]