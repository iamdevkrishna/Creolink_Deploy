from rest_framework import serializers
from .models import Project, Message, ProjectFile, Client, UserProfile  # 👈 IMPORTANT: Import UserProfile!


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name', 'profile_image', 'magic_link_id']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'


class ProjectFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFile
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    files = ProjectFileSerializer(many=True, read_only=True)
    client_info = ClientSerializer(source='client', read_only=True)

    agency_image = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'status', 'due_date', 'created_at', 'user', 'client', 'client_info', 'messages',
                  'files', 'agency_image']
        read_only_fields = ['user']

    def get_agency_image(self, obj):
        try:
            # 👈 BULLETPROOF FIX: Query the database directly instead of guessing relations
            profile = UserProfile.objects.filter(user=obj.user).first()
            if profile and profile.profile_image:
                return str(profile.profile_image.url)
        except Exception as e:
            print(f"Error loading agency image: {e}")  # This will print to your terminal if it fails!
        return None