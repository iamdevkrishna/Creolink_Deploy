from django.urls import path, include
from rest_framework.routers import DefaultRouter

# 1. IMPORT client_portal_upload_photo HERE
from .views import (
    ProjectViewSet, MessageViewSet, ProjectFileViewSet, ClientViewSet,
    client_portal_view, client_send_message, get_freelancer_profile,
    upload_freelancer_photo, client_portal_upload_photo, client_upload_file
)

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'files', ProjectFileViewSet, basename='file')

urlpatterns = [
    path('', include(router.urls)),
    path('portal/<uuid:magic_link_id>/', client_portal_view, name='client_portal'),
    path('portal/<uuid:magic_link_id>/projects/<int:project_id>/messages/', client_send_message,
         name='client_send_message'),
         
    # NEW: Route for clients to upload files to a project thread
    path('portal/<uuid:magic_link_id>/projects/<int:project_id>/files/', client_upload_file, name='client_upload_file'),

    # 2. ADD THE MISSING URL ROUTE FOR CLIENT PHOTO UPLOAD
    path('portal/<uuid:magic_link_id>/upload_photo/', client_portal_upload_photo, name='client_portal_upload_photo'),

    # Freelancer routes
    path('user/me/', get_freelancer_profile, name='get_freelancer_profile'),
    path('user/upload_photo/', upload_freelancer_photo, name='upload_freelancer_photo'),
]