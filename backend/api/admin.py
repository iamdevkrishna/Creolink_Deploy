from django.contrib import admin
from .models import Client, Project, Message, ProjectFile

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    # This makes the Magic Link visible in the list and the edit page
    list_display = ('name', 'magic_link_id')
    readonly_fields = ('magic_link_id',)

admin.site.register(Project)
admin.site.register(Message)
admin.site.register(ProjectFile)