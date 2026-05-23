from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
# IMPORTANT: Import Parsers to handle standard image/file uploads (multpart form data)
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Client, Project, Message, ProjectFile
from .serializers import ClientSerializer, ProjectSerializer, MessageSerializer, ProjectFileSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from rest_framework.decorators import action



from rest_framework.permissions import AllowAny # Add this import

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    @action(detail=False, methods=['get'], permission_classes=[AllowAny]) # 👈 Temporarily unlocked!
    @action(detail=False, methods=['get'])
    def summary(self, request):  # Renamed to 'summary' since it does more than just count now
        # 1. Grab all the clients
        queryset = self.get_queryset()

        # 2. Count them
        total_clients = queryset.count()

        # 3. Translate the Django objects into JSON using your Serializer
        serializer = self.get_serializer(queryset, many=True)

        # 4. Send it all back
        return Response({
            "success": True,
            "total_clients": total_clients,
            "client_details": serializer.data  # 👈 This adds the full list of names/images!
        })
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        queryset = Project.objects.all().order_by('-created_at')
        client_id = self.request.query_params.get('client_id')
        if client_id is not None:
            queryset = queryset.filter(client__id=client_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all().order_by('timestamp')
    serializer_class = MessageSerializer


class ProjectFileViewSet(viewsets.ModelViewSet):
    queryset = ProjectFile.objects.all().order_by('-uploaded_at')
    serializer_class = ProjectFileSerializer


# --- THE MAGIC LINK PORTAL ENDPOINTS ---

@api_view(['GET'])
@permission_classes([AllowAny])  # Unlocked for clients
def client_portal_view(request, magic_link_id):
    try:
        client = Client.objects.get(magic_link_id=magic_link_id)
        projects = Project.objects.filter(client=client).order_by('-created_at')

        return Response({
            "client": ClientSerializer(client).data,
            "projects": ProjectSerializer(projects, many=True).data
        })
    except Client.DoesNotExist:
        return Response({"error": "Portal link is invalid."}, status=404)


@api_view(['POST'])
@permission_classes([AllowAny])  # Unlocked for clients to reply
def client_send_message(request, magic_link_id, project_id):
    try:
        client = Client.objects.get(magic_link_id=magic_link_id)
        project = Project.objects.get(id=project_id, client=client)

        content = request.data.get('content')
        if not content:
            return Response({"error": "Message cannot be empty."}, status=400)

        message = Message.objects.create(
            project=project,
            sender=client.name,
            content=content,
            is_client=True
        )

        return Response(MessageSerializer(message).data, status=201)

    except (Client.DoesNotExist, Project.DoesNotExist):
        return Response({"error": "Access Denied."}, status=403)


# --- UNLOCKED CLIENT SELF-UPLOAD PHOTO ENDPOINT ---
@api_view(['POST'])
@permission_classes([AllowAny])  # Bypasses JWT lock
@parser_classes([MultiPartParser, FormParser])  # Handles image file data
def client_portal_upload_photo(request, magic_link_id):
    try:
        # 1. Verify the client using the secret link
        client = Client.objects.get(magic_link_id=magic_link_id)

        # 2. Grab the image file from React
        if 'profile_image' not in request.FILES:
            return Response({"error": "No image provided."}, status=400)

        image_file = request.FILES['profile_image']

        # 3. Update the database. Django automatically handles replacing ImageFields.
        client.profile_image = image_file
        client.save()

        # 4. Return standard client data including new avatar URL
        return Response(ClientSerializer(client).data, status=200)

    except Client.DoesNotExist:
        return Response({"error": "Access Denied. Invalid link."}, status=403)



@api_view(['POST'])
@permission_classes([AllowAny])  # Unlocked for clients to reply
@parser_classes([MultiPartParser, FormParser])
def client_upload_file(request, magic_link_id, project_id):
    try:
        client = Client.objects.get(magic_link_id=magic_link_id)
        project = Project.objects.get(id=project_id, client=client)

        if 'file' not in request.FILES:
            return Response({"error": "No file provided."}, status=400)

        file = request.FILES['file']
        project_file = ProjectFile.objects.create(
            project=project,
            file=file,
            uploaded_by=client.name,
            is_client=True
        )

        return Response(ProjectFileSerializer(project_file).data, status=201)

    except (Client.DoesNotExist, Project.DoesNotExist):
        return Response({"error": "Access Denied. Invalid link or project."}, status=403)


# --- FREELANCER PROFILE ENDPOINTS ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_freelancer_profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    image_url = profile.profile_image.url if profile.profile_image else None
    return Response({"username": request.user.username, "profile_image": image_url})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_freelancer_photo(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    if 'profile_image' in request.FILES:
        profile.profile_image = request.FILES['profile_image']
        profile.save()

    image_url = profile.profile_image.url if profile.profile_image else None
    return Response({"username": request.user.username, "profile_image": image_url})