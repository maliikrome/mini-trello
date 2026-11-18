from rest_framework import serializers #serializers, is a toolbox inside DRF that acts like a translator.
                                      
from .models import Task
from .models import Comment         # The leading dot (.) is a Python shortcut that means "in the exact same folder as this file.  
                                      #Task is the specific model you created earlier so the serializeer knows which data fields it needs to translate

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'text']

class TaskSerializer(serializers.ModelSerializer): #serializers.ModelSerializer gives your class automatic JSON translation superpowers
    comments = CommentSerializer(many = True, required = False)

    class Meta:                                     #class Meta tells ModelSerializer how to build itself
        model= Task
        fields = '__all__'

    def update(self, instance, validated_data):                      # instance is the existing object , validated data is the new information validated by serializer
        comments_data = validated_data.pop('comments',[])            # [] is the default value, comments is the key name that contains the list of comments
        instance = super().update(instance, validated_data)          #task serializer inherits from model serializer
                                                                            # and that has built in update(), so we say use the drf provided function, so it recieves , instance and validated data, instance for the exisiting data and validated for the new data
        for comment_data in comments_data:                                  # we assign this to instance so it refers to the updated task object
            Comment.objects.create(task = instance,**comment_data) # saves comments one by one according to the task
        return instance                                         # we return the updated task object so the task serializer can use this object to generate responses