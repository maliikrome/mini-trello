from django.db import models # django is the framwework , db is database related package , models contain tools for defining database models
#django.db is the package , models is the module

# Create your models here.
class Task(models.Model): #django already has a class model that provides database functionality thats why .Model is used
    PRIORITY = [          # models is the toolbox imported, .Model is a pre-written Python class living inside that models file
        ('high','High'),
        ('medium','Medium'),
        ('low','Low')
    ]
    STATUS = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done')
    ]

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY)
    category = models.CharField(max_length=10)
    due_date = models.DateField()
    status = models.CharField(max_length=20,choices=STATUS,default='todo')

    def __str__(self):
        return self.title

class Comment(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comment'
    )
    text = models.TextField()

    def __str__(self):
        return self.text