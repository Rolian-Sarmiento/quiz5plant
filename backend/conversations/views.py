from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Conversation, Message
from .serializers import ConversationDetailSerializer, ConversationListSerializer, MessageSerializer
from .topic_guard import make_assistant_reply

# Create your views here.

def _make_conversation_title(first_message: str) -> str:
    words = (first_message or '').strip().split()
    if not words:
        return 'New conversation'
    return ' '.join(words[:6])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    """Create a new conversation with the first user message and an assistant reply."""
    message = (request.data.get('message') or '').strip()
    if not message:
        return Response({'error': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)

    conversation = Conversation.objects.create(
        user=request.user,
        title=_make_conversation_title(message),
    )

    user_msg = Message.objects.create(conversation=conversation, role='user', content=message)
    assistant_msg = Message.objects.create(
        conversation=conversation,
        role='assistant',
        content=make_assistant_reply(message),
    )
    # Ensure updated_at reflects latest activity
    conversation.save()

    serializer = ConversationDetailSerializer(conversation)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_list_view(request):
    conversations = Conversation.objects.filter(user=request.user).order_by('-updated_at')
    serializer = ConversationListSerializer(conversations, many=True)
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
    serializer = ConversationDetailSerializer(conversation)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message_view(request, id):
    """Append a user message + assistant reply to an existing conversation."""
    message = (request.data.get('message') or '').strip()
    if not message:
        return Response({'error': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        conversation = Conversation.objects.get(_id=id, user=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

    user_msg = Message.objects.create(conversation=conversation, role='user', content=message)
    assistant_msg = Message.objects.create(
        conversation=conversation,
        role='assistant',
        content=make_assistant_reply(message),
    )
    conversation.save()

    convo_serializer = ConversationDetailSerializer(conversation)
    new_messages = MessageSerializer([user_msg, assistant_msg], many=True).data
    return Response(
        {
            'conversation': convo_serializer.data,
            'newMessages': new_messages,
        },
        status=status.HTTP_200_OK,
    )