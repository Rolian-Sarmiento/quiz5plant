from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'createdAt']


class ConversationListSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='_id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'createdAt', 'updatedAt']


class ConversationDetailSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='_id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'createdAt', 'updatedAt', 'messages']

    def get_messages(self, obj):
        qs = obj.messages.order_by('created_at')
        return MessageSerializer(qs, many=True).data