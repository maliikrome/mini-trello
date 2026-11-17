#views are the brain that handle all the requests
from rest_framework import viewsets       # viewsets is a toolbox containing pre built logic for handling standard web requests GET,PPOST,DELETE,PATCH
from .models import Task,Comment               # We import task model because out view needs to interact with the database
from .serializers import TaskSerializer,CommentSerializer  # we import serializers because out view need to validate incoming data and to convert database records into json data


class TaskViewSet(viewsets.ModelViewSet): # •  A ModelViewSet automatically gives you the code to list all tasks, view one task, add a new task, edit an existing task, and delete a task.
    queryset = Task.objects.all()           # tells the Viewset where to get the data . it fetches every row from your task database table.
    serializer_class = TaskSerializer  
    
class CommentViewSet(viewsets.ModelViewSet):

    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    def get_queryset(self):
        task_id = self.request.query_params.get('task')
        if task_id:
            return Comment.objects.filter(task_id=task_id)
        return Comment.objects.none()
