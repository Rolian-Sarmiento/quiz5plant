from django.urls import path
from . import views

urlpatterns = [
    path('conversation/', views.chat_view, name='create-conversation'),
    path('conversations/', views.conversation_list_view, name='list-conversations'),
    path('conversations/<uuid:id>/', views.conversation_detail_view, name='detail-conversation'),
    path('conversations/<uuid:id>/messages/', views.send_message_view, name='send-message'),
]