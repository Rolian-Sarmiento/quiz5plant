from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.register_view, name='signup'),
    path('signin/', views.MyTokenObtainPairView.as_view(), name='signin'),
]