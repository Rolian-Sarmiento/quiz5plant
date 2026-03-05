from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Conversation
from .serializers import ConversationSerializer

# Create your views here.

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    serializer = ConversationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_list_view(request):
    conversations = Conversation.objects.filter(user=request.user).order_by('-updated_at')
    serializer = ConversationSerializer(conversations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_detail_view(request, id):
    try:
        conversation = Conversation.objects.get(_id=id, user=request.user)
    except Conversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found.'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = ConversationSerializer(conversation)
    return Response(serializer.data, status=status.HTTP_200_OK)