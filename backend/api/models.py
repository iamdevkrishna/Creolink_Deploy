from django.db import models
from django.contrib.auth.models import User
import uuid


class Client(models.Model):
    name = models.CharField(max_length=100)
    # Switch this from URLField to ImageField
    profile_image = models.ImageField(upload_to='client_avatars/', blank=True, null=True)
    magic_link_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects', null=True)
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=50, default="In Progress")
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # NEW: The ultimate database lock.
        # It forces the combination of Client + Title to be 100% unique!
        constraints = [
            models.UniqueConstraint(fields=['client', 'title'], name='unique_project_per_client')
        ]

    def __str__(self):
        return self.title

class Message(models.Model):
    project = models.ForeignKey(Project, related_name='messages', on_delete=models.CASCADE)
    sender = models.CharField(max_length=100)
    content = models.TextField()
    is_client = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.content[:30]}..."


class ProjectFile(models.Model):
    project = models.ForeignKey(Project, related_name='files', on_delete=models.CASCADE)
    file = models.FileField(upload_to='project_assets/', blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True)

    # NEW FIELDS: Track who uploaded the asset!
    uploaded_by = models.CharField(max_length=100, default="Dev Krishna")
    is_client = models.BooleanField(default=False)
    
    # NEW FIELD: Support for external assets (Google Drive etc.)
    file_url = models.URLField(max_length=1000, blank=True, null=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.file and not self.file_name:
            self.file_name = self.file.name.split('/')[-1]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.file_name or self.file_url or "Asset"

# NEW: Freelancer Profile Model
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_image = models.ImageField(upload_to='freelancer_avatars/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"