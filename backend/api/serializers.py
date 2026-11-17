from rest_framework import serializers #serializers, is a toolbox inside DRF that acts like a translator.
                                      
from .models import Task
from .models import Comment         # The leading dot (.) is a Python shortcut that means "in the exact same folder as this file.  
                                      #Task is the specific model you created earlier so the serializeer knows which data fields it needs to translate
class TaskSerializer(serializers.ModelSerializer): #serializers.ModelSerializer gives your class automatic JSON translation superpowers
    
    class Meta:                                     #class Meta tells ModelSerializer how to build itself
        model= Task
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'task', 'text']